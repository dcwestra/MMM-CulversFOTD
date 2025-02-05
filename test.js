const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment'); // To handle date parsing and comparison

// Function to fetch and process the flavor of the day
const getFlavorOfTheDay = async (storeSlug) => {
    const url = `https://www.culvers.com/restaurants/${storeSlug}`;
    console.log(`Fetching data from: ${url}`);

    try {
        const { data } = await axios.get(url);

        // Load the page content with cheerio
        const $ = cheerio.load(data);
        const scriptTag = $('script#__NEXT_DATA__');

        if (!scriptTag.length) {
            throw new Error("__NEXT_DATA__ script not found on the page.");
        }

        // Parse the JSON from the script tag
        const jsonData = JSON.parse(scriptTag.html());
        console.log("Fetched data:", jsonData);

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

            console.log("Today's flavor:", flavorTitle, "for", storeName);

            // You can log the data to the console for testing, or output it to a file
            const flavorData = {
                store: storeName,
                flavor: flavorTitle,
                description: flavorDescription,
                image: flavorImage,
                tomorrowFlavor: flavors[1] ? flavors[1].title : "", // Add tomorrow's flavor if available
            };

            // Optionally, write the result to a JSON file
            const fs = require('fs');
            fs.writeFileSync('flavor_of_the_day.json', JSON.stringify(flavorData, null, 2));

        } else {
            console.error("No flavor found for today's date.");
        }

    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
};

// Replace 'storeSlug' with the actual store slug when testing
getFlavorOfTheDay('walker-mi-wilson-ave');
