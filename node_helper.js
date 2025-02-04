const NodeHelper = require("node_helper");
const axios = require("axios");
const cheerio = require("cheerio");

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

            // Parse JSON from the script tag content
            const jsonData = JSON.parse(scriptTag.html());

            // Extract store name
            const storeName = 
                jsonData.props?.pageProps?.page?.customData?.restaurantDetails?.title;
            
            // Extract flavor of the day
            const flavorData =
                jsonData.props?.pageProps?.page?.customData?.restaurantDetails?.flavorOfTheDay;

            if (!flavorData || flavorData.length === 0) {
                throw new Error("Flavor of the day not found");
            }

            // Get the first flavor in the array
            const flavor = flavorData[0];

            // Get tomorrow's flavor if available
            const tomorrowFlavor = flavorData[1] ? `Tomorrow's flavor: ${flavorData[1].title}` : "";
            
            // Send the extracted data back to MagicMirror
            this.sendSocketNotification("FLAVOR_OF_THE_DAY", {
                store: storeName,
                flavor: flavor.title,
                description: flavor.description,
                image: flavor.image?.src,
                tomorrowFlavor: tomorrowFlavor, // Add tomorrow's flavor
        });

    } catch (error) {
        console.error("Error fetching flavor of the day:", error.message);
        this.sendSocketNotification("FLAVOR_OF_THE_DAY_ERROR", { error: error.message });
    }
}
});
