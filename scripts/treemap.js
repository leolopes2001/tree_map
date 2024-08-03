import Shape from "./shape.js";

export default class TreeMap {
  constructor() {
    this._items = [];
    this._shapes = [];
    this._totalQuantity = 0;
    this._count = 0;
    this._containerWidth = 0;
    this._containerHeight = 0;
    this._aspectRatioGoal = 1;
    this._graphicsContext = null;
  }

  setDimensions(width, height) {
    this._containerWidth = width;
    this._containerHeight = height;
    return this;
  }

  setContext(ctx) {
    this._graphicsContext = ctx;
    return this;
  }

  configureItems(items) {
    this._items = [...items];
    this._count = this._items.length;
    return this;
  }

  calculateTotal() {
    this._totalQuantity = this._items.reduce((sum, item) => sum + item.qty, 0);
    return this;
  }

  generateTreemap() {
    const containerWidth = this._containerWidth;
    const containerHeight = this._containerHeight;

    const totalArea = containerWidth * containerHeight;

    const itemRatios = [];

    const itemList = [...this._items];

    for (let index = 0; index < this._count; index++) {
      itemRatios.push(itemList[index].qty / this._totalQuantity);
    }

    let availableWidth = containerWidth;
    let availableHeight = containerHeight;

    for (let index = 0; index < this._count; index++) {
      const currentItem = itemList[index];

      if (currentItem) {
        let ratioSum = itemRatios[index];

        const isVerticalLayout = availableWidth / availableHeight < 1;

        let allocatedArea = ratioSum * totalArea;

        let rectWidth;
        let rectHeight;

        if (isVerticalLayout) {
          rectWidth = availableWidth;
          rectHeight = allocatedArea / availableWidth;
        } else {
          rectWidth = allocatedArea / availableHeight;
          rectHeight = availableHeight;
        }

        const shapeDetails = {
          width: rectWidth,
          height: rectHeight,
          value: currentItem.qty,
          aspectRatio: isVerticalLayout
            ? rectHeight / rectWidth
            : rectWidth / rectHeight,
          children: [[currentItem.qty, currentItem.name , currentItem.percentage]],
        };

        let currentAspectRatio = this.calculateAspectRatio(
          this.getNonZeroValue(availableWidth - rectWidth, availableWidth),
          this.getNonZeroValue(availableHeight - rectHeight, availableHeight)
        );

        for (let subIndex = index + 1; subIndex < this._count; subIndex++) {
          if (itemList[subIndex]) {
            const nextItemQuantity = itemList[subIndex].qty;

            let itemCount = subIndex - index + 1;

            ratioSum += itemRatios[subIndex];

            allocatedArea = ratioSum * totalArea;

            if (isVerticalLayout) {
              rectWidth = shapeDetails.width;
              rectHeight = allocatedArea / availableWidth;
            } else {
              rectWidth = allocatedArea / availableHeight;
              rectHeight = shapeDetails.height;
            }

            const currentRatio = isVerticalLayout
              ? rectHeight / rectWidth
              : rectWidth / rectHeight;

            const averageRatio = (shapeDetails.aspectRatio + currentRatio) / itemCount;

            let isPreviousRatioBetter;
            if (
              this.roundToDecimal(currentAspectRatio, 1) ===
                this._aspectRatioGoal &&
              this.isInRange(
                this._aspectRatioGoal - 0.4,
                averageRatio,
                this._aspectRatioGoal + 0.4
              )
            ) {
              isPreviousRatioBetter = true;
            } else if (
              this.roundToDecimal(shapeDetails.aspectRatio, 1) ===
              this._aspectRatioGoal
            ) {
              isPreviousRatioBetter = true;
            } else {
              const previousDiff = Math.abs(
                this._aspectRatioGoal - averageRatio
              );
              const currentDiff = Math.abs(
                this._aspectRatioGoal - shapeDetails.aspectRatio
              );
              isPreviousRatioBetter = previousDiff - currentDiff > 0;
            }

            if (isPreviousRatioBetter) {
              ratioSum -= itemRatios[subIndex];
              break;
            }

            currentAspectRatio = this.calculateAspectRatio(
              this.getNonZeroValue(availableWidth - rectWidth, availableWidth),
              this.getNonZeroValue(
                availableHeight - rectHeight,
                availableHeight
              )
            );

            shapeDetails.width = rectWidth;

            shapeDetails.height = rectHeight;

            shapeDetails.aspectRatio = averageRatio;

            shapeDetails.value += nextItemQuantity;

            shapeDetails.children.push([nextItemQuantity, itemList[subIndex].name, itemList[subIndex].percentage]);

            delete itemList[subIndex];
          }
        }
        let startX = containerWidth - availableWidth;

        let startY = containerHeight - availableHeight;

        for (
          let childIndex = 0;
          childIndex < shapeDetails.children.length;
          childIndex++
        ) {
          const child = shapeDetails.children[childIndex]
          const childValue = child[0] / shapeDetails.value;

            let childWidth;
            let childHeight;

            if (isVerticalLayout) {
              childWidth = childValue * shapeDetails.width;
              childHeight = shapeDetails.height;
            } else {
              childWidth = shapeDetails.width;
              childHeight = childValue * shapeDetails.height;
            }

          const shape = new Shape(
            this._graphicsContext,
            0,
            0,
            childWidth,
            childHeight,
            child[1],
            child[2]
          );

          shape.y = startY;
          shape.x = startX;

          startY += isVerticalLayout ? 0 : childHeight;
          startX += isVerticalLayout ? childWidth : 0;

          shape.executeDraw();

          this._shapes.push(shape);
        }

        if (isVerticalLayout) {
          availableHeight -= shapeDetails.height;
        } else {
          availableWidth -= shapeDetails.width;
        }

        delete itemList[index];
      }
    }
  }

  getNonZeroValue = (value, defaultValue) =>
    value === 0 ? defaultValue : value;

  calculateAspectRatio(width, height) {
    if (width === height) return 1;
    return Math.max(width, height) / Math.min(width, height);
  }

  isInRange = (min, value, max) => value >= min && value <= max;

  roundToDecimal(value, decimals) {
    const [integerPart, decimalPart] = String(value).split(".");
    if (!decimalPart || decimals === 0) return Number(integerPart);
    const truncatedDecimal = decimalPart.slice(0, decimals);
    return Number(`${integerPart}.${truncatedDecimal}`);
  }
}
