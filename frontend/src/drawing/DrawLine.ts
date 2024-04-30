import {lerp, Vector2} from "math.gl";

export default class DrawLine {

    public points: Array<Vector2> = []
    drawSize: number;


    constructor() {

    }

    smoothing() {

        let temp: Array<Vector2> = []
        for (let p of this.points) {
            temp.push(p.clone())
        }
        for (let i = 1; i < this.points.length - 1; i++) {

            let p1 = temp[i - 1]
            let p2 = temp[i + 1]
            p1.add(p2)
            p1.scale(0.5)
            p1.subtract(temp[i])
            // p1.scale(0.5)

            this.points[i].add(p1);
        }
    }

    addPoint(p: Vector2) {
        if (this.points.length > 1) {

            let lastPoint = this.points[this.points.length - 1];

            let dist = p.distance(lastPoint);

            let numSteps = Math.floor(dist / this.drawSize * 6);
            if (numSteps == 0) return;
            this.points.push(p)


            if (numSteps < 2) {
                this.points.push(p)
            } else {
                for (let i = 1; i < numSteps; i++) {
                    let pos = 1.0 / numSteps * i;

                    this.points.push(lerp(lastPoint, p, pos) as Vector2);

                }

            }

        } else {

            this.points.push(p)
        }


    }


}
