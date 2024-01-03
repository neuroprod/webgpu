import Model from "../lib/model/Model";
import UI from "../lib/UI/UI";

export default class Clock {
    private hours: Model;
    private minutes: Model;

    constructor(hours: Model, minutes: Model) {
        this.hours = hours;

        this.minutes = minutes;
        this.setTime(5, 30);
    }

    setTime(hour: number, minutes: number) {
        hour += minutes / 60
        this.hours.setEuler(0, 0, -hour / 12 * Math.PI * 2)
        this.minutes.setEuler(0, 0, -minutes / 60 * Math.PI * 2)
    }

    onUI() {
        let h = UI.LFloatSlider("clock", 0, 0, 12);
        let m = (h - Math.floor(h)) * 60;
   
        this.setTime(Math.floor(h), Math.floor(m))
    }
}
