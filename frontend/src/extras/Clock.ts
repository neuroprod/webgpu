import Model from "../lib/model/Model";

export default class Clock {
    private hours: Model;
    private minutes: Model;
    private timeCount = 0

    constructor(hours: Model, minutes: Model) {
        this.hours = hours;

        this.minutes = minutes;
        this.setTime(8, 30);
    }

    addTime() {
        this.timeCount++;

        this.setTime(8 + this.timeCount, Math.round(Math.random() * 40) + 10);
    }

    setTime(hour: number, minutes: number) {
        hour += minutes / 60
        this.hours.setEuler(0, 0, -hour / 12 * Math.PI * 2)
        this.minutes.setEuler(0, 0, -minutes / 60 * Math.PI * 2)
    }

    /*onUI() {
        let h = UI.LFloatSlider("clock", 0, 0, 12);
        let m = (h - Math.floor(h)) * 60;
let d =new Date()
        this.setTime(d.getHours(), d.getMinutes())
    }*/
}
