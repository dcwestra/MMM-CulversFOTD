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

            // Get today's and tomorrow's dates in 'YYYY-MM-DD' format
            const today = moment().format('YYYY-MM-DD');
            const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

            let flavorForToday = null;
            let flavorForTomorrow = null;

            for (let flavor of flavors) {
                const flavorDate = moment(flavor.onDate).format('YYYY-MM-DD');

                if (flavorDate === today) {
                    flavorForToday = flavor;
                } else if (flavorDate === tomorrow) {
                    flavorForTomorrow = flavor;
                }

                // Exit loop early if both are found
                if (flavorForToday && flavorForTomorrow) break;
            }

            // Prepare data for MagicMirror
            const flavorData = {
                store: jsonData.props?.pageProps?.page?.customData?.restaurantDetails?.name || "Culver's",
                flavor: flavorForToday ? flavorForToday.title : "Not available",
                description: flavorForToday ? flavorForToday.description : "",
                image: flavorForToday?.image?.src || "",
                tomorrowFlavor: flavorForTomorrow ? `Tomorrow's flavor:<br>${flavorForTomorrow.title}` : "Not available",
            };

            // Send the flavor data back to MagicMirror
            this.sendSocketNotification("FLAVOR_OF_THE_DAY", flavorData);

        } catch (error) {
            console.error("Error fetching data:", error.message);
            this.sendSocketNotification("FLAVOR_OF_THE_DAY_ERROR", { error: error.message });
        }
    },
});
