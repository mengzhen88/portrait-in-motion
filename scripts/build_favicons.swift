import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Keep the original portrait proportions and leave space above the hair.
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let sourceURL = root.appendingPathComponent("assets/home/header-portrait.png")
let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil)!
let portrait = CGImageSourceCreateImageAtIndex(source, 0, nil)!
let canvasWidth = CGFloat(portrait.width)
let headroom = canvasWidth * 0.06

for (size, filename) in [(32, "favicon-32.png"), (64, "favicon-64.png"), (180, "apple-touch-icon.png")] {
    let context = CGContext(data: nil, width: size, height: size,
        bitsPerComponent: 8, bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    let scale = CGFloat(size) / canvasWidth
    context.scaleBy(x: scale, y: scale)
    context.interpolationQuality = .high
    context.draw(portrait, in: CGRect(x: 0,
        y: canvasWidth - CGFloat(portrait.height) - headroom,
        width: canvasWidth, height: CGFloat(portrait.height)))
    let target = root.appendingPathComponent("assets/identity/" + filename)
    let destination = CGImageDestinationCreateWithURL(target as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, context.makeImage()!, nil)
    precondition(CGImageDestinationFinalize(destination))
}
