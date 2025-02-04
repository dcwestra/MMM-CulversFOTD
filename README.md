# MMM-CulversFOTD

A MagicMirror module that displays the Culver's flavor of the day from a specific store. It pulls data from the Culver's website and shows today's flavor, tomorrow's flavor, and an optional description and image.

![image](https://github.com/user-attachments/assets/a4f17dc4-e5c1-493d-bd99-cdf571fd436d)


## Features

- Display the current flavor of the day from Culver's
- Optionally display a description and image of the flavor
- Optionally show tomorrow's flavor

## Installation

1. Navigate to your MagicMirror modules directory:
   ```bash
   cd ~/MagicMirror/modules
   ```

2. Clone this repository:
   ```bash
   git clone https://github.com/dcwestra/MMM-CulversFOTD.git
   ```

3. Navigate into the newly cloned directory:
   ```bash
   cd MMM-CulversFOTD
   ```

4. Install the required dependencies:
   ```bash
   npm install
   ```

5. Add the modules to your config.js:
   ```bash
   {
    module: "MMM-CulversFOTD",
    position: "top_center",  // Position of the module on the MagicMirror
    config: {
        storeSlug: "sauk-city",            // Your store slug (can be found in the store's URL)
        showDescription: true,             // Optional: Show the description (true/false)
        showImage: true,                   // Optional: Show the image (true/false)
        showTomorrow: true,                // Optional: Show tomorrow's flavor (true/false)
     }
   }
   ```

6. Finding the `storeSlug`:
   Navigate to the desired store page and copy the location name from the URL
   Example: The `storeSlug` for `https://www.culvers.com/restaurants/sauk-city` would be `sauk-city`

   ![image](https://github.com/user-attachments/assets/99fcb5e2-32fa-4708-93e7-eebaed0de1e7)

   

## Configuration

Option|Possible values|Default|Description
------|------|------|-----------
`storeSlug`|`string`|`"sauk-city"`|The store's unique identifier (found in URL)
`showDescription`|`true,false`|`true`|Optional: Whether or not to display the flavor's description
`showImage`|`true,false`|`true`|Optional: Whether or not to display an image of the flavor
`showTomorrow`|`true,false`|`true`|Optional: Whether or not to display tomorrow's flavor


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

## Acknowledgments

- MagicMirror² for creating the framework.
- The Culver's website for providing the data.
