import SelectItem from "./math/SelectItem";

export default class UIUtils {
    //only for basic enum types
    /*
          export enum TestEnum {
          Up,
          Down,
          Left,
          Right,
          }

      */

    public static EnumToSelectItem(en: any): Array<SelectItem> {
        let selectArray = [];
        for (const value in Object.keys(en)) {
            if (typeof en[value] !== "string") {
                continue;
            }
            let name = en[Number(value)];
            let s = new SelectItem(name, en[name]);
            selectArray.push(s);
        }
        return selectArray;
    }
}
