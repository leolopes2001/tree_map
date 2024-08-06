import TreeMap from "./treemap.js";

class TreemapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.canvasElement = null;
    this.drawingContext = null;
    this.canvasDimensions = {
      width: 0,
      height: 0,
    };
    this.dataItems = [
      { id: crypto.randomUUID(), name: "Pepsi", qty: 8000, percentage: 70 },
      { id: crypto.randomUUID(), name: "Sprite", qty: 3000, percentage: -70 },
      { id: crypto.randomUUID(), name: "CocaCola", qty: 1000, percentage: 95 },
      { id: crypto.randomUUID(), name: "Guaraná Jesus", qty: 1000, percentage: -2 },
      { id: crypto.randomUUID(), name: "Fanta Uva", qty: 800, percentage: 50 },
      { id: crypto.randomUUID(), name: "Guaraná", qty: 500, percentage: 20 },
    ];
    this.treeMapInstance = new TreeMap();
    this.initialize();
  }

  initialize() {
    document.addEventListener("DOMContentLoaded", () => {
      this.updateCanvasDimensions();
      this.initializeCanvas();
      this.renderTreemap();
      this.renderConfigItems();
      this.setupResizeListener();
      this.setupSubmitFormUpdateListerner();
      this.setupSubmitFormAddShapeListener();
    });
  }

  updateCanvasDimensions() {
    this.canvasDimensions.width = window.innerWidth;
    this.canvasDimensions.height = window.innerHeight;
  }

  initializeCanvas() {
    try {
      this.canvasElement = document.createElement("canvas");
      this.canvasElement.width = this.canvasDimensions.width;
      this.canvasElement.height = this.canvasDimensions.height;
      document.getElementById(this.containerId).appendChild(this.canvasElement);
      this.drawingContext = this.canvasElement.getContext("2d");
    } catch (error) {
      console.error(error);
    }
  }

  renderTreemap() {
    try {
      this.treeMapInstance
        .setDimensions(
          this.canvasDimensions.width,
          this.canvasDimensions.height
        )
        .setContext(this.drawingContext)
        .configureItems(this.dataItems)
        .calculateTotal()
        .generateTreemap();
    } catch (error) {
      console.error(error);
    }
  }

  renderConfigItems() {
    const listItemsContainer = document.querySelector("#list_items");
    listItemsContainer.innerHTML = "";

    this.dataItems.forEach((item) => {
      listItemsContainer.insertAdjacentHTML(
        "beforeend",
        `
        <li class="d-flex flex-column gap-2 border border-1 rounded-1 p-3">
          <input type='hidden' id="${item.id}_input"/>
          <div class="remove">
            <button class="btn btn-remove" type="button" id="${item.id}" onclick="treemapManager.removeItem('${item.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div>
            <label class="form-label">Nome do refrigerante</label>
            <input value="${item.name}" type="text" required name="name[]" class="form-control" placeholder="Ex: Coca - Cola" />
          </div>
          <div>
            <label class="form-label">Vendas em Litros no Ano de 2024</label>
            <input type="number" class="form-control" required name="qty[]" value="${item.qty}" placeholder="Ex: 30000" />
          </div>
          <div>
            <label class="form-label">Oscilação percentual nas vendas</label>
            <input type="number" class="form-control" required value="${item.percentage}" name="percentage[]" placeholder="Ex: 10% " />
          </div>
        </li>
        `
      );
    });
  }

  clearCanvas() {
    if (this.canvasElement) {
      const context = this.canvasElement.getContext("2d");
      context.clearRect(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    }
  }

  removeItem(id) {
    const idx = this.dataItems.findIndex((item) => item.id === id);

    if (idx !== -1) {
      this.dataItems.splice(idx, 1);
      this.clearCanvas();
      this.renderTreemap();
      this.renderConfigItems();
    }
  }

  addNewShape = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const qty = +formData.get("qty");
    const percentage = +formData.get("percentage");
    
    this.dataItems = [
      ...this.dataItems,
      { id: crypto.randomUUID(), name, qty, percentage },
    ];
    e.target.reset();

    this.clearCanvas();
    this.renderTreemap();
    this.renderConfigItems();

    const container = document.querySelector(".offcanvas-body");

    container.scrollTo({
      top:container.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  };

  updateItems = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const names = formData.getAll("name[]");
    const qtys = formData.getAll("qty[]");
    const percentages = formData.getAll("percentage[]");

    const dataItems = [];

    for (let i = 0; i < names.length; i++) {
      const itemId = e.target
        .querySelectorAll('input[type="hidden"]')
        [i].id.split("_")[0];

      dataItems.push({
        id: itemId,
        name: names[i],
        qty: +qtys[i],
        percentage: +percentages[i],
      });
    }

    this.dataItems = [...dataItems];
    this.clearCanvas();
    this.renderTreemap();
    this.renderConfigItems();
  };

  setupSubmitFormUpdateListerner() {
    document
      .querySelector("#shapes_items_form")
      .addEventListener("submit", this.updateItems);
  }

  setupSubmitFormAddShapeListener() {
    document
      .querySelector("#addShapeForm")
      .addEventListener("submit", this.addNewShape);
  }

  setupResizeListener() {
    const debounce = (func, delay) => {
      let timeoutId;
      return function (...args) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    };

    window.addEventListener(
      "resize",
      debounce(() => {
        this.clearCanvas();
        this.updateCanvasDimensions();
        this.canvasElement.width = this.canvasDimensions.width;
        this.canvasElement.height = this.canvasDimensions.height;
        this.renderTreemap();
        this.renderConfigItems();
      }, 150)
    );
  }
}

const treemapManager = new TreemapManager("canvas_treemap");
window.treemapManager = treemapManager;
