"""Move MP4 metadata before the movie data without re-encoding any video frames."""
from pathlib import Path
import struct

CONTAINERS = {b'moov', b'trak', b'mdia', b'minf', b'stbl', b'edts', b'dinf', b'udta'}

def boxes(data, start=0, end=None):
    end = len(data) if end is None else end
    while start < end:
        size, kind = struct.unpack_from('>I4s', data, start)
        assert size >= 8 and start + size <= end, 'Incomplete MP4 atom'
        yield start, size, kind
        start += size

def shift_offsets(data, delta):
    out = bytearray(data)
    def visit(start, end):
        for p, size, kind in boxes(out, start, end):
            if kind in (b'stco', b'co64'):
                count = struct.unpack_from('>I', out, p + 12)[0]
                fmt, step = ('>I', 4) if kind == b'stco' else ('>Q', 8)
                for i in range(count):
                    at = p + 16 + i * step
                    value = struct.unpack_from(fmt, out, at)[0]
                    struct.pack_into(fmt, out, at, value + delta)
            elif kind in CONTAINERS:
                visit(p + 8, p + size)
    visit(0, len(out))
    return out

for path in Path('assets/feishu-permissions/videos').glob('*.mp4'):
    source = path.read_bytes()
    atoms = list(boxes(source))
    mp, ms, _ = next(x for x in atoms if x[2] == b'moov')
    dp, _, _ = next(x for x in atoms if x[2] == b'mdat')
    if mp < dp:
        print(path.name, 'already streams immediately')
        continue
    assert mp + ms == len(source), 'Unexpected trailing MP4 atoms'
    metadata = shift_offsets(source[mp:mp + ms], ms)
    result = source[:dp] + metadata + source[dp:mp]
    assert len(result) == len(source)
    assert source[dp + 8:mp] == result[dp + ms + 8:], 'Movie bytes changed'
    path.write_bytes(result)
    print(path.name, 'streaming metadata moved; original frames unchanged')
