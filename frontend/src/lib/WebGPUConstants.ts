export const GPUPrimitiveTopology = {
    PointList: 'point-list',
    LineList: 'line-list',
    LineStrip: 'line-strip',
    TriangleList: 'triangle-list',
    TriangleStrip: 'triangle-strip',
};

export const CompareFunction = {
    Never: 'never' as GPUCompareFunction,
    Less: 'less' as GPUCompareFunction,
    Equal: 'equal' as GPUCompareFunction,
    LessEqual: 'less-equal' as GPUCompareFunction,
    Greater: 'greater' as GPUCompareFunction,
    NotEqual: 'not-equal' as GPUCompareFunction,
    GreaterEqual: 'greater-equal' as GPUCompareFunction,
    Always: 'always' as GPUCompareFunction,
};

export const StoreOp = {
    Store: 'store' as GPUStoreOp,
    Discard: 'discard' as GPUStoreOp
};

export const LoadOp = {
    Load: 'load' as GPULoadOp,
    Clear: 'clear' as GPULoadOp
};

export const GPUFrontFace = {
    CCW: 'ccw',
    CW: 'cw'
};

export const CullMode = {
    None: 'none' as GPUCullMode,
    Front: 'front' as GPUCullMode,
    Back: 'back' as GPUCullMode
};

export const IndexFormat = {
    Uint16: 'uint16' as GPUIndexFormat,
    Uint32: 'uint32' as GPUIndexFormat
};

export const GPUVertexFormat = {
    Uint8x2: 'uint8x2',
    Uint8x4: 'uint8x4',
    Sint8x2: 'sint8x2',
    Sint8x4: 'sint8x4',
    Unorm8x2: 'unorm8x2',
    Unorm8x4: 'unorm8x4',
    Snorm8x2: 'snorm8x2',
    Snorm8x4: 'snorm8x4',
    Uint16x2: 'uint16x2',
    Uint16x4: 'uint16x4',
    Sint16x2: 'sint16x2',
    Sint16x4: 'sint16x4',
    Unorm16x2: 'unorm16x2',
    Unorm16x4: 'unorm16x4',
    Snorm16x2: 'snorm16x2',
    Snorm16x4: 'snorm16x4',
    Float16x2: 'float16x2',
    Float16x4: 'float16x4',
    Float32: 'float32',
    Float32x2: 'float32x2',
    Float32x3: 'float32x3',
    Float32x4: 'float32x4',
    Uint32: 'uint32',
    Uint32x2: 'uint32x2',
    Uint32x3: 'uint32x3',
    Uint32x4: 'uint32x4',
    Sint32: 'sint32',
    Sint32x2: 'sint32x2',
    Sint32x3: 'sint32x3',
    Sint32x4: 'sint32x4'
};

export const TextureFormat = {

    // 8-bit formats

    R8Unorm: 'r8unorm' as GPUTextureFormat,
    R8Snorm: 'r8snorm' as GPUTextureFormat,
    R8Uint: 'r8uint' as GPUTextureFormat,
    R8Sint: 'r8sint' as GPUTextureFormat,

    // 16-bit formats

    R16Uint: 'r16uint' as GPUTextureFormat,
    R16Sint: 'r16sint' as GPUTextureFormat,
    R16Float: 'r16float' as GPUTextureFormat,
    RG8Unorm: 'rg8unorm' as GPUTextureFormat,
    RG8Snorm: 'rg8snorm' as GPUTextureFormat,
    RG8Uint: 'rg8uint' as GPUTextureFormat,
    RG8Sint: 'rg8sint' as GPUTextureFormat,

    // 32-bit formats

    R32Uint: 'r32uint' as GPUTextureFormat,
    R32Sint: 'r32sint' as GPUTextureFormat,
    R32Float: 'r32float' as GPUTextureFormat,
    RG16Uint: 'rg16uint' as GPUTextureFormat,
    RG16Sint: 'rg16sint' as GPUTextureFormat,
    RG16Float: 'rg16float' as GPUTextureFormat,
    RGBA8Unorm: 'rgba8unorm' as GPUTextureFormat,
    RGBA8UnormSRGB: 'rgba8unorm-srgb' as GPUTextureFormat,
    RGBA8Snorm: 'rgba8snorm' as GPUTextureFormat,
    RGBA8Uint: 'rgba8uint' as GPUTextureFormat,
    RGBA8Sint: 'rgba8sint' as GPUTextureFormat,
    BGRA8Unorm: 'bgra8unorm' as GPUTextureFormat,
    BGRA8UnormSRGB: 'bgra8unorm-srgb' as GPUTextureFormat,

    // Packed 32-bit formats
    RGB9E5UFloat: 'rgb9e5ufloat' as GPUTextureFormat,//hdr
    RGB10A2Unorm: 'rgb10a2unorm' as GPUTextureFormat,
    RG11B10UFloat: 'rg11b10ufloat' as GPUTextureFormat,

    // 64-bit formats

    RG32Uint: 'rg32uint' as GPUTextureFormat,
    RG32Sint: 'rg32sint' as GPUTextureFormat,
    RG32Float: 'rg32float' as GPUTextureFormat,
    RGBA16Uint: 'rgba16uint' as GPUTextureFormat,
    RGBA16Sint: 'rgba16sint' as GPUTextureFormat,
    RGBA16Float: 'rgba16float' as GPUTextureFormat,

    // 128-bit formats

    RGBA32Uint: 'rgba32uint' as GPUTextureFormat,
    RGBA32Sint: 'rgba32sint' as GPUTextureFormat,
    RGBA32Float: 'rgba32float' as GPUTextureFormat,

    // Depth and stencil formats

    Stencil8: 'stencil8' as GPUTextureFormat,
    Depth16Unorm: 'depth16unorm' as GPUTextureFormat,
    Depth24Plus: 'depth24plus' as GPUTextureFormat,
    Depth24PlusStencil8: 'depth24plus-stencil8' as GPUTextureFormat,
    Depth32Float: 'depth32float' as GPUTextureFormat,

    // 'depth32float-stencil8' extension

    Depth32FloatStencil8: 'depth32float-stencil8' as GPUTextureFormat,

    // BC compressed formats usable if 'texture-compression-bc' is both
    // supported by the device/user agent and enabled in requestDevice.

    BC1RGBAUnorm: 'bc1-rgba-unorm',
    BC1RGBAUnormSRGB: 'bc1-rgba-unorm-srgb',
    BC2RGBAUnorm: 'bc2-rgba-unorm',
    BC2RGBAUnormSRGB: 'bc2-rgba-unorm-srgb',
    BC3RGBAUnorm: 'bc3-rgba-unorm',
    BC3RGBAUnormSRGB: 'bc3-rgba-unorm-srgb',
    BC4RUnorm: 'bc4-r-unorm',
    BC4RSnorm: 'bc4-r-snorm',
    BC5RGUnorm: 'bc5-rg-unorm',
    BC5RGSnorm: 'bc5-rg-snorm',
    BC6HRGBUFloat: 'bc6h-rgb-ufloat',
    BC6HRGBFloat: 'bc6h-rgb-float',
    BC7RGBAUnorm: 'bc7-rgba-unorm',
    BC7RGBAUnormSRGB: 'bc7-rgba-srgb',

    // ETC2 compressed formats usable if 'texture-compression-etc2' is both
    // supported by the device/user agent and enabled in requestDevice.

    ETC2RGB8Unorm: 'etc2-rgb8unorm',
    ETC2RGB8UnormSRGB: 'etc2-rgb8unorm-srgb',
    ETC2RGB8A1Unorm: 'etc2-rgb8a1unorm',
    ETC2RGB8A1UnormSRGB: 'etc2-rgb8a1unorm-srgb',
    ETC2RGBA8Unorm: 'etc2-rgba8unorm',
    ETC2RGBA8UnormSRGB: 'etc2-rgba8unorm-srgb',
    EACR11Unorm: 'eac-r11unorm',
    EACR11Snorm: 'eac-r11snorm',
    EACRG11Unorm: 'eac-rg11unorm',
    EACRG11Snorm: 'eac-rg11snorm',

    // ASTC compressed formats usable if 'texture-compression-astc' is both
    // supported by the device/user agent and enabled in requestDevice.

    ASTC4x4Unorm: 'astc-4x4-unorm',
    ASTC4x4UnormSRGB: 'astc-4x4-unorm-srgb',
    ASTC5x4Unorm: 'astc-5x4-unorm',
    ASTC5x4UnormSRGB: 'astc-5x4-unorm-srgb',
    ASTC5x5Unorm: 'astc-5x5-unorm',
    ASTC5x5UnormSRGB: 'astc-5x5-unorm-srgb',
    ASTC6x5Unorm: 'astc-6x5-unorm',
    ASTC6x5UnormSRGB: 'astc-6x5-unorm-srgb',
    ASTC6x6Unorm: 'astc-6x6-unorm',
    ASTC6x6UnormSRGB: 'astc-6x6-unorm-srgb',
    ASTC8x5Unorm: 'astc-8x5-unorm',
    ASTC8x5UnormSRGB: 'astc-8x5-unorm-srgb',
    ASTC8x6Unorm: 'astc-8x6-unorm',
    ASTC8x6UnormSRGB: 'astc-8x6-unorm-srgb',
    ASTC8x8Unorm: 'astc-8x8-unorm',
    ASTC8x8UnormSRGB: 'astc-8x8-unorm-srgb',
    ASTC10x5Unorm: 'astc-10x5-unorm',
    ASTC10x5UnormSRGB: 'astc-10x5-unorm-srgb',
    ASTC10x6Unorm: 'astc-10x6-unorm',
    ASTC10x6UnormSRGB: 'astc-10x6-unorm-srgb',
    ASTC10x8Unorm: 'astc-10x8-unorm',
    ASTC10x8UnormSRGB: 'astc-10x8-unorm-srgb',
    ASTC10x10Unorm: 'astc-10x10-unorm',
    ASTC10x10UnormSRGB: 'astc-10x10-unorm-srgb',
    ASTC12x10Unorm: 'astc-12x10-unorm',
    ASTC12x10UnormSRGB: 'astc-12x10-unorm-srgb',
    ASTC12x12Unorm: 'astc-12x12-unorm',
    ASTC12x12UnormSRGB: 'astc-12x12-unorm-srgb',

};

export const AddressMode = {
    ClampToEdge: 'clamp-to-edge' as GPUAddressMode,
    Repeat: 'repeat' as GPUAddressMode,
    MirrorRepeat: 'mirror-repeat' as GPUAddressMode
};

export const SamplerBindingType = {
    Filtering: 'filtering' as GPUSamplerBindingType,
    NonFiltering: 'non-filtering' as GPUSamplerBindingType,
    Comparison: 'comparison' as GPUSamplerBindingType
};

export const FilterMode = {
    Linear: 'linear' as GPUFilterMode,
    Nearest: 'nearest' as GPUFilterMode
};

export const BlendFactor = {
    Zero: 'zero' as GPUBlendFactor,
    One: 'one' as GPUBlendFactor,
    SrcColor: 'src-color' as GPUBlendFactor,
    OneMinusSrcColor: 'one-minus-src-color' as GPUBlendFactor,
    SrcAlpha: 'src-alpha' as GPUBlendFactor,
    OneMinusSrcAlpha: 'one-minus-src-alpha' as GPUBlendFactor,
    DstColor: 'dst-color' as GPUBlendFactor,
    OneMinusDstColor: 'one-minus-dst-color' as GPUBlendFactor,
    DstAlpha: 'dst-alpha' as GPUBlendFactor,
    OneMinusDstAlpha: 'one-minus-dst-alpha' as GPUBlendFactor,
    SrcAlphaSaturated: 'src-alpha-saturated' as GPUBlendFactor,
    BlendColor: 'blend-color' as GPUBlendFactor,
    OneMinusBlendColor: 'one-minus-blend-color' as GPUBlendFactor
};

export const BlendOperation = {
    Add: 'add' as GPUBlendOperation,
    Subtract: 'subtract' as GPUBlendOperation,
    ReverseSubtract: 'reverse-subtract' as GPUBlendOperation,
    Min: 'min' as GPUBlendOperation,
    Max: 'max' as GPUBlendOperation,
};

export const ColorWriteFlags = {
    None: 0 as GPUColorWriteFlags,
    Red: 0x1 as GPUColorWriteFlags,
    Green: 0x2 as GPUColorWriteFlags,
    Blue: 0x4 as GPUColorWriteFlags,
    Alpha: 0x8 as GPUColorWriteFlags,
    All: 0xF as GPUColorWriteFlags
};

export const GPUStencilOperation = {
    Keep: 'keep',
    Zero: 'zero',
    Replace: 'replace',
    Invert: 'invert',
    IncrementClamp: 'increment-clamp',
    DecrementClamp: 'decrement-clamp',
    IncrementWrap: 'increment-wrap',
    DecrementWrap: 'decrement-wrap'
};

export const GPUBindingType = {
    UniformBuffer: 'uniform-buffer',
    StorageBuffer: 'storage-buffer',
    ReadonlyStorageBuffer: 'readonly-storage-buffer',
    Sampler: 'sampler',
    ComparisonSampler: 'comparison-sampler',
    SampledTexture: 'sampled-texture',
    MultisampledTexture: 'multisampled-texture',
    ReadonlyStorageTexture: 'readonly-storage-texture',
    WriteonlyStorageTexture: 'writeonly-storage-texture'
};

export const TextureDimension = {
    OneD: '1d' as GPUTextureDimension,
    TwoD: '2d' as GPUTextureDimension,
    ThreeD: '3d' as GPUTextureDimension
};

export const TextureViewDimension = {
    OneD: '1d' as GPUTextureViewDimension,
    TwoD: '2d' as GPUTextureViewDimension,
    TwoDArray: '2d-array' as GPUTextureViewDimension,
    Cube: 'cube' as GPUTextureViewDimension,
    CubeArray: 'cube-array' as GPUTextureViewDimension,
    ThreeD: '3d' as GPUTextureViewDimension
};

export const GPUTextureAspect = {
    All: 'all',
    StencilOnly: 'stencil-only',
    DepthOnly: 'depth-only'
};

export const GPUInputStepMode = {
    Vertex: 'vertex',
    Instance: 'instance'
};

export const GPUFeatureName = {
    DepthClipControl: 'depth-clip-control',
    Depth32FloatStencil8: 'depth32float-stencil8',
    TextureCompressionBC: 'texture-compression-bc',
    TextureCompressionETC2: 'texture-compression-etc2',
    TextureCompressionASTC: 'texture-compression-astc',
    TimestampQuery: 'timestamp-query',
    IndirectFirstInstance: 'indirect-first-instance',
    ShaderF16: 'shader-f16',
    RG11B10UFloat: 'rg11b10ufloat-renderable',
    BGRA8UNormStorage: 'bgra8unorm-storage',
    Float32Filterable: 'float32-filterable'
};
