Module.register("MMM-CulversFOTD", {
  defaults: {
    storeSlug: "sauk-city", // Default store, change as needed
    showDescription: true,
    showImage: true,
    showTomorrowFlavor: true
  },

  getStyles: function () {
  return ["MMM-CulversFOTD.css"];
  },

  start: function () {
      this.flavorData = null;
      this.sendSocketNotification("GET_FLAVOR_OF_THE_DAY", { storeSlug: this.config.storeSlug });
  },

  socketNotificationReceived: function (notification, payload) {
      if (notification === "FLAVOR_OF_THE_DAY") {
        this.flavorData = payload;
          this.updateDom();
      }
  },

  getHeader: function () {
      return this.flavorData?.store || "Culver's Flavor of the Day";
  },

  getDom: function () {
      let wrapper = document.createElement("div");
      wrapper.className = "MMM-CulversFOTD";

      if (!this.flavorData) {
          wrapper.innerHTML = "Loading flavor...";
          return wrapper;
      }

      if (this.flavorData.error) {
          wrapper.innerHTML = `<div class="error">${this.flavorData.error}</div>`;
          return wrapper;
      }
      
      // Add Flavor of the Day
      let flavor = document.createElement("div");
      flavor.innerHTML = this.flavorData.flavor;
      flavor.className = "flavor";
      wrapper.appendChild(flavor);

      // Add Description (if enabled)
      if (this.config.showDescription) {
          let description = document.createElement("div");
          description.innerHTML = this.flavorData.description;
          description.className = "description";
          wrapper.appendChild(description);
      }

      // Add Image (if enabled)
      if (this.config.showImage && this.flavorData.image) {
          let img = document.createElement("img");
          img.src = this.flavorData.image;
          img.calssName = "flavor-image";
          wrapper.appendChild(img);
      }

      // Add Tomorrow's Flavor if available
      if (this.config.showTomorrowFlavor && this.flavorData.tomorrowFlavor) {
          let tomorrow = document.createElement("div");
          tomorrow.innerHTML = this.flavorData.tomorrowFlavor;
          tomorrow.className = "tomorrow";
          wrapper.appendChild(tomorrow);
      }

      return wrapper;
  }
});
