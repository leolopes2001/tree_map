import Shape from "./shape.js";

export default class TreeMap {
  constructor() {
    this._items = [];
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

    const itemList = [...this._items];

    const itemRatios = itemList.map((item) => item.qty / this._totalQuantity);

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
          children: [
            [currentItem.qty, currentItem.name, currentItem.percentage],
          ],
        };

        let currentAspectRatio = this.calculateAspectRatio(
          this.getNonZeroValue(availableWidth - rectWidth, availableWidth),
          this.getNonZeroValue(availableHeight - rectHeight, availableHeight)
        );

        // inclusão de itens
        for (let subIndex = index + 1; subIndex < this._count; subIndex++) {
          if (itemList[subIndex]) {

        
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


            // nova razão 1:1
            const currentRatio = isVerticalLayout
              ? rectHeight / rectWidth
              : rectWidth / rectHeight;

            const averageRatio =
              (shapeDetails.aspectRatio + currentRatio) / itemCount;

            let isPreviousRatioBetter;

            // avalia agrupamento
            if (
              this.roundToDecimal(currentAspectRatio, 1) === 1 &&
              this.isInRange(0.6, averageRatio, 1.4)
            ) {
              isPreviousRatioBetter = true;
            } else if (this.roundToDecimal(shapeDetails.aspectRatio, 1) === 1) {
              isPreviousRatioBetter = true;
            } else {
              const previousDiff = Math.abs(1 - averageRatio);
              const currentDiff = Math.abs(1 - shapeDetails.aspectRatio);

              isPreviousRatioBetter = previousDiff - currentDiff > 0;
            }

            if (isPreviousRatioBetter) {
              ratioSum -= itemRatios[subIndex];
              break;
            }
            const nextItemQuantity = itemList[subIndex].qty;

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

            shapeDetails.children.push([
              nextItemQuantity,
              itemList[subIndex].name,
              itemList[subIndex].percentage,
            ]);

            delete itemList[subIndex];
          }
        }

        let startX = containerWidth - availableWidth;

        let startY = containerHeight - availableHeight;

        shapeDetails.children.forEach((child) => {
          const childValue = child[0] / shapeDetails.value;
          const name = child[1];
          const percent = child[2];

          let childWidth = shapeDetails.width;
          let childHeight = shapeDetails.height;

          if (isVerticalLayout) {
            childWidth = childValue * shapeDetails.width;
          } else {
            childHeight = childValue * shapeDetails.height;
          }

          const shape = new Shape(
            this._graphicsContext,
            startX,
            startY,
            childWidth,
            childHeight,
            name,
            percent
          );

          startY += isVerticalLayout ? 0 : childHeight;
          startX += isVerticalLayout ? childWidth : 0;

          shape.executeDraw();
        });

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
