import * as ReactThreeFiber from "react-three-fiber"
import * as Three from "three"

export type Object3DProps = ReactThreeFiber.Object3DNode<
    Three.Object3D,
    typeof Three.Object3D
>

export type Object3DMotionProps = Object3DProps & MotionProps

export type ReactThreeFibreComponents = {
    // audio: ReactThreeFiber.AudioProps
    audioListener: ReactThreeFiber.AudioListenerProps
    positionalAudio: ReactThreeFiber.PositionalAudioProps

    mesh: ReactThreeFiber.MeshProps
    instancedMesh: ReactThreeFiber.InstancedMeshProps
    scene: ReactThreeFiber.SceneProps
    sprite: ReactThreeFiber.SpriteProps
    lOD: ReactThreeFiber.LODProps
    skinnedMesh: ReactThreeFiber.SkinnedMeshProps
    skeleton: ReactThreeFiber.SkeletonProps
    bone: ReactThreeFiber.BoneProps
    lineSegments: ReactThreeFiber.LineSegmentsProps
    lineLoop: ReactThreeFiber.LineLoopProps
    // line: ReactThreeFiber.LineProps
    points: ReactThreeFiber.PointsProps
    group: ReactThreeFiber.GroupProps
    immediateRenderObject: ReactThreeFiber.ImmediateRenderObjectProps

    // cameras
    camera: ReactThreeFiber.CameraProps
    perspectiveCamera: ReactThreeFiber.PerspectiveCameraProps
    orthographicCamera: ReactThreeFiber.OrthographicCameraProps
    cubeCamera: ReactThreeFiber.CubeCameraProps
    arrayCamera: ReactThreeFiber.ArrayCameraProps

    // geometry
    geometry: ReactThreeFiber.GeometryProps
    instancedBufferGeometry: ReactThreeFiber.InstancedBufferGeometryProps
    bufferGeometry: ReactThreeFiber.BufferGeometryProps
    boxBufferGeometry: ReactThreeFiber.BoxBufferGeometryProps
    circleBufferGeometry: ReactThreeFiber.CircleBufferGeometryProps
    coneBufferGeometry: ReactThreeFiber.ConeBufferGeometryProps
    cylinderBufferGeometry: ReactThreeFiber.CylinderBufferGeometryProps
    dodecahedronBufferGeometry: ReactThreeFiber.DodecahedronBufferGeometryProps
    extrudeBufferGeometry: ReactThreeFiber.ExtrudeBufferGeometryProps
    icosahedronBufferGeometry: ReactThreeFiber.IcosahedronBufferGeometryProps
    latheBufferGeometry: ReactThreeFiber.LatheBufferGeometryProps
    octahedronBufferGeometry: ReactThreeFiber.OctahedronBufferGeometryProps
    parametricBufferGeometry: ReactThreeFiber.ParametricBufferGeometryProps
    planeBufferGeometry: ReactThreeFiber.PlaneBufferGeometryProps
    polyhedronBufferGeometry: ReactThreeFiber.PolyhedronBufferGeometryProps
    ringBufferGeometry: ReactThreeFiber.RingBufferGeometryProps
    shapeBufferGeometry: ReactThreeFiber.ShapeBufferGeometryProps
    sphereBufferGeometry: ReactThreeFiber.SphereBufferGeometryProps
    tetrahedronBufferGeometry: ReactThreeFiber.TetrahedronBufferGeometryProps
    textBufferGeometry: ReactThreeFiber.TextBufferGeometryProps
    torusBufferGeometry: ReactThreeFiber.TorusBufferGeometryProps
    torusKnotBufferGeometry: ReactThreeFiber.TorusKnotBufferGeometryProps
    tubeBufferGeometry: ReactThreeFiber.TubeBufferGeometryProps
    wireframeGeometry: ReactThreeFiber.WireframeGeometryProps
    parametricGeometry: ReactThreeFiber.ParametricGeometryProps
    tetrahedronGeometry: ReactThreeFiber.TetrahedronGeometryProps
    octahedronGeometry: ReactThreeFiber.OctahedronGeometryProps
    icosahedronGeometry: ReactThreeFiber.IcosahedronGeometryProps
    dodecahedronGeometry: ReactThreeFiber.DodecahedronGeometryProps
    polyhedronGeometry: ReactThreeFiber.PolyhedronGeometryProps
    tubeGeometry: ReactThreeFiber.TubeGeometryProps
    torusKnotGeometry: ReactThreeFiber.TorusKnotGeometryProps
    torusGeometry: ReactThreeFiber.TorusGeometryProps
    textGeometry: ReactThreeFiber.TextGeometryProps
    sphereGeometry: ReactThreeFiber.SphereGeometryProps
    ringGeometry: ReactThreeFiber.RingGeometryProps
    planeGeometry: ReactThreeFiber.PlaneGeometryProps
    latheGeometry: ReactThreeFiber.LatheGeometryProps
    shapeGeometry: ReactThreeFiber.ShapeGeometryProps
    extrudeGeometry: ReactThreeFiber.ExtrudeGeometryProps
    edgesGeometry: ReactThreeFiber.EdgesGeometryProps
    coneGeometry: ReactThreeFiber.ConeGeometryProps
    cylinderGeometry: ReactThreeFiber.CylinderGeometryProps
    circleGeometry: ReactThreeFiber.CircleGeometryProps
    boxGeometry: ReactThreeFiber.BoxGeometryProps

    // materials
    material: ReactThreeFiber.MaterialProps
    shadowMaterial: ReactThreeFiber.ShadowMaterialProps
    spriteMaterial: ReactThreeFiber.SpriteMaterialProps
    rawShaderMaterial: ReactThreeFiber.RawShaderMaterialProps
    shaderMaterial: ReactThreeFiber.ShaderMaterialProps
    pointsMaterial: ReactThreeFiber.PointsMaterialProps
    meshPhysicalMaterial: ReactThreeFiber.MeshPhysicalMaterialProps
    meshStandardMaterial: ReactThreeFiber.MeshStandardMaterialProps
    meshPhongMaterial: ReactThreeFiber.MeshPhongMaterialProps
    meshToonMaterial: ReactThreeFiber.MeshToonMaterialProps
    meshNormalMaterial: ReactThreeFiber.MeshNormalMaterialProps
    meshLambertMaterial: ReactThreeFiber.MeshLambertMaterialProps
    meshDepthMaterial: ReactThreeFiber.MeshDepthMaterialProps
    meshDistanceMaterial: ReactThreeFiber.MeshDistanceMaterialProps
    meshBasicMaterial: ReactThreeFiber.MeshBasicMaterialProps
    meshMatcapMaterial: ReactThreeFiber.MeshMatcapMaterialProps
    lineDashedMaterial: ReactThreeFiber.LineDashedMaterialProps
    lineBasicMaterial: ReactThreeFiber.LineBasicMaterialProps

    // primitive
    primitive: ReactThreeFiber.PrimitiveProps

    // lights and other
    light: ReactThreeFiber.LightProps
    spotLightShadow: ReactThreeFiber.SpotLightShadowProps
    spotLight: ReactThreeFiber.SpotLightProps
    pointLight: ReactThreeFiber.PointLightProps
    rectAreaLight: ReactThreeFiber.RectAreaLightProps
    hemisphereLight: ReactThreeFiber.HemisphereLightProps
    directionalLightShadow: ReactThreeFiber.DirectionalLightShadowProps
    directionalLight: ReactThreeFiber.DirectionalLightProps
    ambientLight: ReactThreeFiber.AmbientLightProps
    lightShadow: ReactThreeFiber.LightShadowProps
    ambientLightProbe: ReactThreeFiber.AmbientLightProbeProps
    hemisphereLightProbe: ReactThreeFiber.HemisphereLightProbeProps
    lightProbe: ReactThreeFiber.LightProbeProps

    // helpers
    spotLightHelper: ReactThreeFiber.SpotLightHelperProps
    skeletonHelper: ReactThreeFiber.SkeletonHelperProps
    pointLightHelper: ReactThreeFiber.PointLightHelperProps
    hemisphereLightHelper: ReactThreeFiber.HemisphereLightHelperProps
    gridHelper: ReactThreeFiber.GridHelperProps
    polarGridHelper: ReactThreeFiber.PolarGridHelperProps
    directionalLightHelper: ReactThreeFiber.DirectionalLightHelperProps
    cameraHelper: ReactThreeFiber.CameraHelperProps
    boxHelper: ReactThreeFiber.BoxHelperProps
    box3Helper: ReactThreeFiber.Box3HelperProps
    planeHelper: ReactThreeFiber.PlaneHelperProps
    arrowHelper: ReactThreeFiber.ArrowHelperProps
    axesHelper: ReactThreeFiber.AxesHelperProps

    // textures
    texture: ReactThreeFiber.TextureProps
    videoTexture: ReactThreeFiber.VideoTextureProps
    dataTexture: ReactThreeFiber.DataTextureProps
    dataTexture3D: ReactThreeFiber.DataTexture3DProps
    compressedTexture: ReactThreeFiber.CompressedTextureProps
    cubeTexture: ReactThreeFiber.CubeTextureProps
    canvasTexture: ReactThreeFiber.CanvasTextureProps
    depthTexture: ReactThreeFiber.DepthTextureProps

    // misc
    raycaster: ReactThreeFiber.RaycasterProps
    vector2: ReactThreeFiber.Vector2Props
    vector3: ReactThreeFiber.Vector3Props
    vector4: ReactThreeFiber.Vector4Props
    euler: ReactThreeFiber.EulerProps
    matrix3: ReactThreeFiber.Matrix3Props
    matrix4: ReactThreeFiber.Matrix4Props
    quaternion: ReactThreeFiber.QuaternionProps
    bufferAttribute: ReactThreeFiber.BufferAttributeProps
    instancedBufferAttribute: ReactThreeFiber.InstancedBufferAttributeProps
    face3: ReactThreeFiber.Face3Props
    color: ReactThreeFiber.ColorProps
    fog: ReactThreeFiber.FogProps
}
