/** Simple class to help work with colors */
export default class ColorService {
    private static _canvasRef: HTMLCanvasElement;
    private static get _canvas(): HTMLCanvasElement {
        // What are the odds we'll ever have a race condition here?  Is it worth it to just create and dispose
        //  of a new canvas each time?
        if (!this._canvasRef) {
            this._canvasRef = document.createElement('canvas');
            this._canvasRef.width = 1;
            this._canvasRef.height = 1;
        }
        return this._canvasRef;
    }

    private static _getRGBA(colorStr: string): Uint8ClampedArray {
        const ctx: CanvasRenderingContext2D = this._canvas.getContext('2d');
        ctx.fillStyle = colorStr;
        ctx.fillRect(0,0,1,1);

        return ctx.getImageData(0, 0, 1, 1).data;
    }

    /** Returns a RGBA string from any possible CSS color string */
    public static CssToRGBA(cssStr: string): string {
        const colorData: Uint8ClampedArray = this._getRGBA(cssStr);
        colorData[3] = colorData[3] / 255;

        return 'rgba(' + colorData.join(',') + ')';
    }

    /** Returns a luminocity value from any possible CSS color string */
    public static GetBrightness(colorStr: string): number {
        const colorData: Uint8ClampedArray = this._getRGBA(colorStr);
        return (0.2126 * colorData[0] + 0.7152 * colorData[1] + 0.0722 * colorData[2]);
    }

    /** Returns a */
    public static GetBrightnessIndex(colorStr: string, numSteps: number): number {
        const brightVal = this.GetBrightness(colorStr);
        const index = (val => {
            const retArray = [];
            for (let x = 0; x <= 255; x += (255 / val)) { retArray.push(x); }
            return retArray;
        })(numSteps).filter(f => f !== 0).reduce((t: number, n: number, i: number) => brightVal > n ? i : t, 0);

        return index;
    }

    public static GetTextColor(colorStr: string): string {
        switch (this.GetBrightnessIndex(colorStr, 3)) {
            case 0:
                return 'rgba(255, 255, 255, 1)';
            case 1:
                return 'rgba(80, 80, 80, 1)';
            case 2:
                return 'rgba(0, 0, 0, 1)';
        }
    }
}
