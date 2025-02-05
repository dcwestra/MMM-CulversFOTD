const NodeHelper = require("node_helper");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-CulversFOTD helper started...");
    },

    socketNotificationReceived: async function (notification, payload) {
        console.log(`Received notification: ${notification} with payload:`, payload);
        
        if (notification === "GET_FLAVOR_OF_THE_DAY") {
            if (!payload || !payload.storeSlug) {
                console.error("Error: storeSlug is missing from payload.");
                this.sendSocketNotification("FLAVOR_OF_THE_DAY_ERROR", { error: "Missing storeSlug" });
                return;
            }

            this.getFlavorOfTheDay(payload.storeSlug);
        }
    },

    // Fetch the flavor of the day based on today's date from Culver's website
    getFlavorOfTheDay: async function (storeSlug) {
        const url = `https://www.culvers.com/restaurants/${storeSlug}`;
        console.log(`Fetching data from: ${url}`);

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        // Find the __NEXT_DATA__ script tag
        const scriptTag = $('script#__NEXT_DATA__');
        if (!scriptTag.length) {
            throw new Error("__NEXT_DATA__ script not found on the page.");
        }

        // Parse the JSON from the script tag
        const jsonData = JSON.parse(scriptTag.html());

        // Now parse the date from the jsonData
        const flavors = jsonData.props?.pageProps?.page?.customData?.restaurantCalendar?.flavors;

        if (!flavors || flavors.length === 0) {
            throw new Error("No flavor data found.");
        }

        // Get today's date in 'YYYY-MM-DD' format
        const today = moment().format('YYYY-MM-DD');

        // Loop through the flavors and find the matching date
        let flavorForToday = null;
        for (let flavor of flavors) {
            const flavorDate = moment(flavor.onDate).format('YYYY-MM-DD'); // Format the timestamp to just date

        if (flavorDate === today) {
            flavorForToday = flavor;
            break;
            }
        }

        // If a flavor is found for today, log and send it
        if (flavorForToday) {
            const storeName = jsonData.props?.pageProps?.page?.customData?.restaurantDetails?.title;
            const flavorTitle = flavorForToday.title;
            const flavorDescription = flavorForToday.description;
            const flavorImage = flavorForToday.image?.src;

        // Prepare data for MagicMirror
        const flavorData = {
            store: storeName,
            flavor: flavorTitle,
            description: flavorDescription,
            image: flavorImage,
            tomorrowFlavor: flavors[1] ? `Tomorrow's flavor:<br>${flavors[1].title}` : "", // Add tomorrow's flavor if available
        };

        // Send the flavor data back to MagicMirror
        this.sendSocketNotification("FLAVOR_OF_THE_DAY", flavorData);

      } else {
        console.error("No flavor found for today's date.");
      }

    } catch (error) {
      console.error("Error fetching data:", error.message);
      this.sendSocketNotification("FLAVOR_OF_THE_DAY_ERROR", { error: error.message });
    }
  },
});
