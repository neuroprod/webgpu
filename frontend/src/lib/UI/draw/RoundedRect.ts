import Vec2 from "../math/Vec2.ts";
import Rect from "../math/Rect.ts";

class RoundedRect{
    private basePoint:Array<Vec2>=[]
    private tempPoints:Array<Vec2>=[]
    private numSteps=5;
    constructor() {

        let stepSize =(Math.PI/2)/this.numSteps;
        for(let quart=0;quart<4;quart++){
            let angleStart =quart*Math.PI/2;
            for(let step =0;step<=this.numSteps;step++){
                let angle = angleStart+(step*stepSize);

                this.tempPoints.push(new Vec2())
                this.basePoint.push(new Vec2(Math.sin(angle),Math.cos(angle)))

            }


        }


    }

    getRect(rect:Rect,radius:number){

        for(let i=0;i<this.basePoint.length;i++){
           let t = this.tempPoints[i]
            t.copy(this.basePoint[i])
            t.scale(radius).add(rect.pos)
            t.x +=radius;
           t.y+=radius;
        }
        let offX =rect.size.x -radius*2;
        let offY =rect.size.y -radius*2;

        for(let i=0;i<=this.numSteps;i++){
            //this.tempPoints[i].x+=offX;
            //this.tempPoints[i].y+=offY;

        }

        for(let i=0;i<=this.numSteps;i++){
            this.tempPoints[i].x+=offX;
            this.tempPoints[i].y+=offY;

        }
        for(let i=this.numSteps+1;i<=(this.numSteps+1)*2-1;i++){
            this.tempPoints[i].x+=offX;


        }
        for(let i=(this.numSteps+1)*3;i<this.basePoint.length;i++){
            this.tempPoints[i].y+=offY;

        }
        return this.tempPoints;


    }


    getRectLeft(rect: Rect, radius: number) {
        //TODO optimise, is total crap
        for(let i=0;i<this.basePoint.length;i++){
            let t = this.tempPoints[i]
            t.copy(this.basePoint[i])
            t.scale(radius).add(rect.pos)
            t.x +=radius;
            t.y+=radius;
        }
        let offX =rect.size.x -radius*2;
        let offY =rect.size.y -radius*2;



        for(let i=0;i<=this.numSteps;i++){
            this.tempPoints[i].x+=offX;
            this.tempPoints[i].y+=offY;

        }
        for(let i=this.numSteps+1;i<=(this.numSteps+1)*2-1;i++){
            this.tempPoints[i].x+=offX;


        }
        for(let i=(this.numSteps+1)*2;i<=(this.numSteps+1)*3;i++){
            this.tempPoints[i].x=rect.pos.x;


        }
        for(let i=(this.numSteps+1)*3;i<this.basePoint.length;i++){
            this.tempPoints[i].x=rect.pos.x;
            this.tempPoints[i].y=rect.pos.y+rect.size.y
        }
        return this.tempPoints;

    }
}
export default new RoundedRect()
