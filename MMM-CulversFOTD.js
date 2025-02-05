Module.register("MMM-CulversFOTD", {
  defaults: {
    storeSlug: "sauk-city",
    showDescription: true,
    showImage: true,
    showTomorrowFlavor: true,
    updateInterval: 3600000,
  },

  getStyles: function () {
  return ["MMM-CulversFOTD.css"];
  },

  start: function () {
      this.flavorData = null;
      this.getData();
      this.scheduleUpdate();
  },

  socketNotificationReceived: function (notification, payload) {
      if (notification === "FLAVOR_OF_THE_DAY") {
        console.log("Received updated flavor data:", payload); // Debugging
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
          img.className = "flavor-image";
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
    },

    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        setInterval(function() {
            self.getData();
        }, nextLoad);
    },

    getData: function () {
        this.sendSocketNotification("GET_FLAVOR_OF_THE_DAY", { storeSlug: this.config.storeSlug });
    }
});
