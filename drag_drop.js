$(function(){
  const map = new ol.Map({
    view: new ol.View({
        center: [0, 0],
        zoom: 1,
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    target: 'map',
  });

  map.getViewport().addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  
  map.getViewport().addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    for (let i = 0; i < files.length; ++i) {
      // Slice the extension out
      const file = files.item(i);
      const fileName = file.name;
      const extension = fileName.slice(fileName.lastIndexOf(".") + 1);

      switch (extension){
        case "geojson":
          var reader = new FileReader();
          reader.onload = (e) => {
              const geojsonData = JSON.parse(e.target.result);
              const vectorSource = new ol.source.Vector({
                  features: new ol.format.GeoJSON().readFeatures(geojsonData)
              });
              const vectorLayer = new ol.layer.Vector({
                  source: vectorSource
              });
              map.addLayer(vectorLayer);
              map.getView().fit(vectorSource.getExtent());
          };

          reader.readAsText(file);
          break;
        case "kml":
          var reader = new FileReader();
          reader.onload = (e) => {
            const kmlData = e.target.result;
            const format = new ol.format.KML();
            const features = format.readFeatures(kmlData, {
                featureProjection: 'EPSG:3857'
            });
            const vectorSource = new ol.source.Vector({
                features: features
            });
            const vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });
            map.addLayer(vectorLayer);
            map.getView().fit(vectorSource.getExtent());
          };

          reader.readAsText(file);
          break;
        case "zip": // Shapefile zipped w/ shp, dbf, and prj files
          // For reference, loadshp is defined in https://gipong.github.io/shp2geojson.js/preview.js
          loadshp({url: file, encoding: 'utf-8'}, function(geojson) {
            const features = new ol.format.GeoJSON().readFeatures(
              geojson,
              { featureProjection: map.getView().getProjection() }
            );
            const vectorSource = new ol.source.Vector({
              features: features
            });
            map.addLayer(
              new ol.layer.Vector({
                source: vectorSource,
              })
            );
            map.getView().fit(vectorSource.getExtent());
          });
          break;
        default:
          console.log("Unsupported file type");
      }
    }
  });
})