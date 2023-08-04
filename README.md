# onebeer

Track and visualize your drinks.

## Features

* Progressive Web App
* Works offline
* Data stays on your device - NO data is transmitted anywhere
* Statistics
* Geospatial heatmap

## Requirements

Access to fine location is needed to log your drinks.
The app must be served via HTTPS, because of `navigator.geolocation`.

## Development

Start development server with HTTPS support.
```
HTTPS=true npm start
```

## Release

Change `homepage` in [package.json](package.json) to your deployment location.

Generate build and deploy to webserver
```
npm run build
rsync -avt --delete build/ <HOST>:<DOCROOT>
```

## Versioning

`0.1.8` Add `current` filter

`0.1.7` Edit tracked drinks

`0.1.6` Customize trackable drinks

`0.1.2` Initial release

## Authors

* **Sebastian Haas** - *Initial release* - [sehaas](https://github.com/sehaas)

See also the list of [contributors](https://github.com/sehaas/onebeer/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
