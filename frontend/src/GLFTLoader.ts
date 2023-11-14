import PreLoader from "./lib/PreLoader";
import Mesh from "./lib/core/Mesh";
import Renderer from "./lib/Renderer";
import Object3D from "./lib/core/Object3D";
import Model from "./lib/model/Model";
import TestShader from "./shaders/TestShader";
import Material from "./lib/core/Material";
import ImagePreloader from "./ImagePreloader";


type Accessor = {
    accessor: any;
    bufferView: any;
}
export default class GLFTLoader {
    public root: Object3D;
    public models:Array<Model>=[]
    public modelsByName:{ [name: string]: Model } = {};
    public objects:Array<Object3D>=[]
    public objectsByName:{ [name: string]: Object3D } = {};
    public meshes: Array<Mesh> = []
    public materials: Array<Material> = []

    private meshBuffer: SharedArrayBuffer | ArrayBuffer;
    private byteLength: any;
    private json: any;
    private accessors: Array<Accessor> = []
    private renderer: Renderer;

    private mainShader: TestShader;


    constructor(renderer: Renderer, url: string, preLoader: PreLoader) {
        this.renderer = renderer;

        this.root = new Object3D(renderer, "sceneRoot");
        this.mainShader =new TestShader(this.renderer,"testShader");


        preLoader.startLoad();
        this.loadURL(url).then(() => {
            preLoader.stopLoad();
        });

    }

    async loadURL(url: any) {

        const responseBuffer = await fetch(url + ".bin")

        this.meshBuffer = await responseBuffer.arrayBuffer();

        const response = await fetch(url + ".json")

        let text = await response.text()
        this.json = JSON.parse(text)

        // this.makeBuffer()
        console.log(this.json)
        this.parseMeshAccessors()
        this.parseMeshes();

        this.parseScene();
    }

    addNodesToObject(parent: Object3D, nodes: Array<number>) {
        for (let nodeID of nodes) {

            let nodeData = this.json.nodes[nodeID];
            let node;
            if (nodeData.mesh != undefined) {
                node = new Model(this.renderer, nodeData.name)
                node.mesh = this.meshes[nodeData.mesh]
                node.material =this.materials[nodeData.mesh]
               this.models.push(node);
                this.modelsByName[node.label] =node;
            } else {
                node = new Object3D(this.renderer, nodeData.name)
            }
            this.objects.push(node);
            this.objectsByName[node.label] =node;
            parent.addChild(node);
            let translation = nodeData.translation;
            if (translation) {
                node.setPosition(translation[0], translation[1], translation[2])

            }

            let scale = nodeData.scale
            if (scale) {
                node.setScale(scale[0], scale[1], scale[2])
            }
            let rotation = nodeData.rotation
            if (rotation) {
                node.setRotation(rotation[0], rotation[1], rotation[2], rotation[3])
            }
            if (nodeData.children) {

                this.addNodesToObject(node, nodeData.children)
            }
        }

    }

    private parseScene() {

        let sceneData = this.json.scenes[0]

        this.addNodesToObject(this.root, sceneData.nodes);

    }

    private parseMeshAccessors() {
        for (let accessor of this.json.accessors) {

            let bufferView = this.json.bufferViews[accessor.bufferView];

            this.accessors.push({accessor: accessor, bufferView: bufferView});
        }
    }
private makeMaterial(name:string){
    let material =new Material(this.renderer,name,this.mainShader);

    let colorTexture = ImagePreloader.getTexture(name+"_Color");
    if(colorTexture) material.uniforms.setTexture("colorTexture",colorTexture)

    let normalTexture = ImagePreloader.getTexture(name+"_Normal");
    if(normalTexture) material.uniforms.setTexture("normalTexture",normalTexture)

    let mraTexture = ImagePreloader.getTexture(name+"_MRA");
    if(mraTexture) material.uniforms.setTexture("mraTexture",mraTexture)


    this.materials.push(material)
}
    private parseMeshes() {

        for (let m of this.json.meshes) {
            let primitive = m.primitives[0];


            this.makeMaterial(m.name)

            let mesh = new Mesh(this.renderer, m.name);

            //5126 float
            //5123 ushort
            //5125  uint

            let accessorIndices = this.accessors[primitive.indices]
            let indexData = this.getSlize(accessorIndices);
            if (accessorIndices.accessor.componentType == 5123) {
                let indices = new Uint16Array(indexData);

                mesh.setIndices(indices)

            } else if (accessorIndices.accessor.componentType == 5123) {
                let indices = new Uint32Array(indexData);
                mesh.setIndices32(indices)
            }
            //POSITION, NORMAL TANGENT TEXCOORD_0,....
            let posAccessor = this.accessors[primitive.attributes.POSITION];
            let positionData = this.getSlize(posAccessor);
            mesh.setVertices(new Float32Array(positionData));


            let normalAccessor = this.accessors[primitive.attributes.NORMAL];
            let normalData = this.getSlize(normalAccessor);
            mesh.setNormals(new Float32Array(normalData));

            let uv0Accessor = this.accessors[primitive.attributes.TEXCOORD_0];
            let uv0Data = this.getSlize(uv0Accessor);
            mesh.setUV0(new Float32Array(uv0Data));

            if(primitive.attributes.TANGENT) {
                let tangentAccessor = this.accessors[primitive.attributes.TANGENT];
                let tangentData = this.getSlize(tangentAccessor);
                mesh.setTangents(new Float32Array(tangentData));
            }
            this.meshes.push(mesh);


        }
    }

    private getSlize(accessor: any) {
        let byteLength = accessor.bufferView.byteLength
        let byteOffset = accessor.bufferView.byteOffset
        let buffer = accessor.bufferView.buffer
        return this.meshBuffer.slice(byteOffset, byteOffset + byteLength);
    }


}
