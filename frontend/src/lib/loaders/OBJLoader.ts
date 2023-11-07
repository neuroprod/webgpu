import Mesh from "../core/Mesh";
import Renderer from "../Renderer";
import PreLoader from "../PreLoader";
import {Vector2, Vector3} from "math.gl";

class Triangle{
    p0:Vector3;
    p1:Vector3;
    p2:Vector3;

    n0:Vector3;
    n1:Vector3;
    n2:Vector3;

    u0:Vector2;
    u1:Vector2;
    u2:Vector2;
}


export default class OBJLoader extends Mesh
{

    private triangles: Array<Triangle>=[];
    constructor(renderer:Renderer,url:string,preLoader:PreLoader) {
      super(renderer,url)

        preLoader.startLoad();
        this.loadURL(url).then(() => {
            preLoader.stopLoad();
        });
    }


    async  loadURL(url: any) {
        const response = await fetch(url)
        let text = await response.text()
        this.parseOBJ(text);

        let vertices: Float32Array =new Float32Array(3*3*this.triangles.length)
        let normals: Float32Array =new Float32Array(3*3*this.triangles.length)
        let uvs: Float32Array =new Float32Array(2*3*this.triangles.length)
        let indices: Uint32Array = new Uint32Array(3*this.triangles.length);
        let vCount =0;
        let nCount =0;
        let uCount =0;
        let indexCount =0;
        for(let t of this.triangles)
        {

            indices [indexCount]=indexCount++
            indices [indexCount]=indexCount++
            indices [indexCount]=indexCount++

            vertices[vCount++] = t.p0.x;
            vertices[vCount++] = t.p0.y;
            vertices[vCount++] = t.p0.z;

            vertices[vCount++] = t.p1.x;
            vertices[vCount++] = t.p1.y;
            vertices[vCount++] = t.p1.z;

            vertices[vCount++] = t.p2.x;
            vertices[vCount++] = t.p2.y;
            vertices[vCount++] = t.p2.z;


            normals[nCount++] = t.n0.x;
            normals[nCount++] = t.n0.y;
            normals[nCount++] = t.n0.z;

            normals[nCount++] = t.n1.x;
            normals[nCount++] = t.n1.y;
            normals[nCount++] = t.n1.z;

            normals[nCount++] = t.n2.x;
            normals[nCount++] = t.n2.y;
            normals[nCount++] = t.n2.z;

            uvs[uCount++] = t.u0.x;
            uvs[uCount++] = t.u0.y;

            uvs[uCount++] = t.u1.x;
            uvs[uCount++] = t.u1.y;

            uvs[uCount++] = t.u2.x;
            uvs[uCount++] = t.u2.y;


        }
        this.setVertices(vertices);
        this.setNormals(normals);
        this.setUV0(uvs);

        this.setIndices32(indices);
    }

    public parseOBJ(text:string)
    {
        const lines = text.split('\n');
        // v float float float
        const vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

        // vn float float float

        const normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

        // vt float float

        const uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

        const face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

        const vertices:Array<Vector3> = [];
        const normals:Array<Vector3> = [];
        const uvs:Array<Vector2> = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            line = line.trim();
            let result;

            if (line.length === 0 || line.charAt(0) === '#') {

            }
            else if ((result = vertex_pattern.exec(line)) !== null) {
                // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                vertices.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
            } else if ((result = normal_pattern.exec(line)) !== null) {
                // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                normals.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
            } else if ((result = uv_pattern.exec(line)) !== null) {
                // ["vt 0.1 0.2", "0.1", "0.2"]

                uvs.push(new Vector2(parseFloat(result[1]), parseFloat(result[2])));
            }else if ((result = face_pattern3.exec(line)) !== null) {
                result = face_pattern3.exec(line)
                let p1 =vertices[parseInt(result[2])]

               let t =new Triangle();
                t.p0=vertices[parseInt(result[2])-1];
                t.p1=vertices[parseInt(result[6])-1];
                t.p2=vertices[parseInt(result[10])-1];

                t.u0=uvs[parseInt(result[3])-1];
                t.u1=uvs[parseInt(result[7])-1];
                t.u2=uvs[parseInt(result[11])-1];


                t.n0=normals[parseInt(result[4])-1];
                t.n1=normals[parseInt(result[8])-1];
                t.n2=normals[parseInt(result[12])-1];


                this.triangles.push(t)

            }
        }

    }
}
