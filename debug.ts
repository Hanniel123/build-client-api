import { DEBUG } from "./config";

class Debug {
    static log(...data: any[]) {
        if (!DEBUG)
            return;
        console.log(data)
    }

    static warn(data: any) {
        if (!DEBUG)
            return;
        console.warn(data);
    }

    static error(data: any) {
        if (!DEBUG)
            return;
        console.error(data);
    }

}

export {
    Debug
}