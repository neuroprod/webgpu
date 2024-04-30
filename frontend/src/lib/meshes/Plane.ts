import Renderer from "../Renderer";
import Mesh from "../core/Mesh";


export default class Plane extends Mesh {
    constructor(
        renderer: Renderer,
        width = 1,
        height = 1,
        segmentsX: number = 1,
        segmentsY: number = 1,
        yUp: boolean = true
    ) {
        super(renderer, "plane");

        const vertexCount: number = (segmentsX + 1) * (segmentsY + 1);
        const positionData: Float32Array = new Float32Array(vertexCount * 3);
        const uvData: Float32Array = new Float32Array(vertexCount * 2);
        const normalsData: Float32Array = new Float32Array(vertexCount * 3);

        let i: number = 0;
        let iUV: number = 0;
        let iNormal: number = 0;

        for (let y: number = 0; y < segmentsY + 1; y++) {
            for (let x: number = 0; x < segmentsX + 1; x++) {
                positionData[i++] = (-1 + (x / segmentsX) * 2) * (width / 2);
                if (yUp) {
                    positionData[i++] = 0;
                    positionData[i++] = (-1 + (y / segmentsY) * 2) * (height / 2);
                } else {
                    positionData[i++] = (-1 + (y / segmentsY) * 2) * (height / 2);
                    positionData[i++] = 0;
                }

                uvData[iUV++] = x / segmentsX;
                uvData[iUV++] = y / segmentsY;

                if (yUp) {
                    normalsData[iNormal++] = 0;
                    normalsData[iNormal++] = 1;
                    normalsData[iNormal++] = 0;
                } else {
                    normalsData[iNormal++] = 0;
                    normalsData[iNormal++] = 0;
                    normalsData[iNormal++] = 1;
                }
            }
        }

        this.setVertices(positionData);
        this.setUV0(uvData);
        this.setNormals(normalsData);

        const triCount: number = segmentsX * segmentsY * 2;
        const indices: Uint32Array = new Uint32Array(triCount * 3);

        const w: number = segmentsX + 1;
        i = 0;
        for (let y: number = 0; y < segmentsY; y++) {
            for (let x: number = 0; x < segmentsX; x++) {
                indices[i++] = y * w + x;
                indices[i++] = (y + 1) * w + x;
                indices[i++] = y * w + x + 1;

                indices[i++] = (y + 1) * w + x;
                indices[i++] = (y + 1) * w + x + 1;
                indices[i++] = y * w + x + 1;
            }
        }

        this.setIndices(Uint16Array.from(indices));
    }
}
