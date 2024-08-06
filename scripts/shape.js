export default class Shape {
  constructor(context, x, y, width, height, name, percent) {
    this._ctx = context;
    this._name = name;
    this.y = y;
    this.x = x;
    this._percent = percent;
    this.height = height;
    this.width = width;
    this._radius = 0;
    this._lineWidth = 4;
  }

  getColorFromPercent() {
    const maxIntensity = 255;
    const minIntensity = 100;

    let intensity;

    if (this._percent >= 0) {
        intensity = Math.min(maxIntensity, minIntensity + this._percent * 2); 
        return `rgb(0, 0, ${intensity})`;
    } else if (this._percent < 0) {
        intensity = Math.min(maxIntensity, minIntensity - this._percent); 
        return `rgb(${intensity}, 0, 0)`;
    }
}

  executeDraw() {
    const lineWidth = this._lineWidth;
    const width = this.width - lineWidth;
    const height = this.height - lineWidth;
    const radius = this._radius;
    const y = this.y + lineWidth;
    const x = this.x + lineWidth;

    this._ctx.beginPath();
    this._ctx.fillStyle = "#3944BC";
    this._ctx.fillStyle = this.getColorFromPercent();
    this._ctx.lineWidth = lineWidth;
    this._ctx.moveTo(x + radius, y);
    this._ctx.arcTo(x + width, y, x + width, y + height, radius);
    this._ctx.arcTo(x + width, y + height, x, y + height, radius);
    this._ctx.arcTo(x, y + height, x, y, radius);
    this._ctx.arcTo(x, y, x + width, y, radius);
    this._ctx.closePath();
    this._ctx.fill();

    this._ctx.fillStyle = "#FFFFFF";
    this._ctx.textAlign = "center";
    this._ctx.textBaseline = "middle";
    this._ctx.font = "16px Arial";
    this._ctx.fillText(
      `${this._name} / ${this._percent}%`,
      x + width / 2,
      y + height / 2
    );
  }
}
