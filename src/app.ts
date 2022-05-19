import './main.scss';

import esri = __esri;
import esriConfig from '@arcgis/core/config';
import { watch } from '@arcgis/core/core/watchUtils';
import Color from '@arcgis/core/Color';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';
import LocatorSearchSource from '@arcgis/core/widgets/Search/LocatorSearchSource';

import Disclaimer from '@vernonia/core/dist/widgets/Disclaimer';

import Layout from '@vernonia/core/dist/Layout';
import '@vernonia/core/dist/Layout.css';

import TaxLotPopup from '@vernonia/core/dist/popups/TaxLotPopup';

import Layers from '@vernonia/core/dist/widgets/Layers';
import '@vernonia/core/dist/widgets/Layers.css';

import PrintSnapshot from '@vernonia/core/dist/widgets/PrintSnapshot';
import '@vernonia/core/dist/widgets/Snapshot.css';

// config portal and auth
esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';

// app config and init loading screen
const title = 'Vernonia Wetlands';

// basemaps
const basemap = new Basemap({
  portalItem: {
    id: '6e9f78f3a26f48c89575941141fd4ac3',
  },
});

const nextBasemap = new Basemap({
  portalItem: {
    id: '2622b9aecacd401583981410e07d5bb9',
  },
});

const taxLots = new FeatureLayer({
  portalItem: {
    id: 'a0837699982f41e6b3eb92429ecdb694',
  },
  popupTemplate: TaxLotPopup,
});
taxLots.when(() => {
  watch(view, 'map.basemap', (basemap: esri.Basemap) => {
    const tlr = taxLots.renderer as esri.SimpleRenderer;
    const tls = tlr.symbol as esri.SimpleFillSymbol;
    tls.outline.color = basemap === nextBasemap ? new Color([246, 213, 109, 0.5]) : new Color([152, 114, 11, 0.5]);
  });
});

const disclaimerText = `<strong>This information is for reference only.</strong>
<br><br>
The Oregon Wetlands Database (2019) is for planning purposes only. It is an estimation of the occurrence and extent of wetlands in Oregon, and does not necessarily map all wetlands or represent wetlands that are subject to Federal or State jurisdiction. It should not be used as a substitute for a wetland determination or delineation performed by a qualified wetland specialist. Many polygons were derived only from aerial photo interpretation and may or may not meet wetland criteria in the field. Per current Federal and Oregon Wetland Mapping Standards, the Oregon Wetlands Database (2019) is "neither designed, nor intended, to support legal, regulatory, or jurisdictional analyses of wetland mapping products, nor does it attempt to differentiate between regulatory and non-regulatory wetlands."
<br><br>
Official determination of wetlands is under the sole jurisdiction of the Dept. of State Lands and/or by a Dept. of State Lands approved consultant. Visit the <calcite-link href="https://www.oregon.gov/dsl/ww/pages/wetlandconservation.aspx" target="_blank">Dept. of State Lands Wetlands</calcite-link> website for more information.
<br><br>
Development in wetlands in Vernonia is regulated under <calcite-link href="https://www.vernonia-or.gov/municipal-code/title-9/" target="_blank">Title 9 Chapter 6 - Development in Wetlands</calcite-link>.
<br><br>
${Disclaimer.getDefaultDisclaimer()}
`;

// view
const view = new MapView({
  map: new Map({
    basemap,
    layers: [
      taxLots,
      // city limits
      new FeatureLayer({
        portalItem: {
          id: '5e1e805849ac407a8c34945c781c1d54',
        },
      }),
      new GroupLayer({
        portalItem: {
          id: 'ddfd99ee04d34444a697eb9d8c272217',
        },
      }),
    ],
    ground: 'world-elevation',
  }),
  zoom: 15,
  center: [-123.18291178267039, 45.8616094153766],
  constraints: {
    rotationEnabled: false,
  },
  popup: {
    dockEnabled: true,
    dockOptions: {
      position: 'bottom-left',
      breakpoint: false,
    },
  },
});

new Layout({
  view,
  loaderOptions: {
    title,
  },
  includeDisclaimer: true,
  disclaimerOptions: {
    title: 'Wetlands Disclaimer',
    text: disclaimerText,
    enableDontShow: false,
  },
  mapHeadingOptions: {
    title,
    logoUrl: 'city_logo_small_white.svg',
    searchViewModel: new SearchViewModel({
      searchAllEnabled: false,
      includeDefaultSources: false,
      locationEnabled: false,
      sources: [
        new LayerSearchSource({
          layer: taxLots,
          outFields: ['*'],
          searchFields: ['ADDRESS'],
          suggestionTemplate: '{ADDRESS}',
          placeholder: 'Tax lot by address',
          name: 'Tax lot by address',
          zoomScale: 3000,
        }),
        new LayerSearchSource({
          layer: taxLots,
          outFields: ['*'],
          searchFields: ['OWNER'],
          suggestionTemplate: '{OWNER}',
          placeholder: 'Tax lot by owner',
          name: 'Tax lot by owner',
          zoomScale: 3000,
        }),
        new LayerSearchSource({
          layer: taxLots,
          outFields: ['*'],
          searchFields: ['ACCOUNT_IDS'],
          suggestionTemplate: '{ACCOUNT_IDS}',
          placeholder: 'Tax lot by tax account',
          name: 'Tax lot by tax account',
          zoomScale: 3000,
        }),
        new LayerSearchSource({
          layer: taxLots,
          outFields: ['*'],
          searchFields: ['TAXLOT_ID'],
          suggestionTemplate: '{TAXLOT_ID}',
          placeholder: 'Tax lot by map and lot',
          name: 'Tax lot by map and lot',
          zoomScale: 3000,
        }),
        new LocatorSearchSource({
          url: 'https://gis.vernonia-or.gov/server/rest/services/LandUse/Vernonia_Address_Locator/GeocodeServer',
          placeholder: 'Vernonia addresses',
          name: 'Vernonia addresses',
        }),
      ],
    }),
  },
  nextBasemap,
  uiWidgets: [
    {
      widget: new Layers({
        view,
      }),
      text: 'Layers',
      icon: 'layers',
      active: true,
    },
    {
      widget: new PrintSnapshot({
        view,
        printServiceUrl:
          'https://gis.vernonia-or.gov/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
      }),
      text: 'Print',
      icon: 'print',
    },
  ],
});

view.when(() => {});

/**
import './main.scss';

// esri config and auth
import esriConfig from '@arcgis/core/config';

// loading screen
import LoadingScreen from './core/widgets/LoadingScreen';
import DisclaimerModal from './core/widgets/DisclaimerModal';

// map, view and layers
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { hybridBasemap } from './core/support/basemaps';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { taxLotsImagery, wetlands } from './core/support/renderers';

// popups
import TaxLotPopup from './core/popups/TaxLotPopup';

// layout
import Viewer from './core/layouts/Viewer';

// search
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';

// widgets
import ViewControl from './core/widgets/ViewControl';
import UIWidgetSwitcher from './core/widgets/UIWidgetSwitcher';

// ui switcher widgets
import LayerListLegend from './core/widgets/LayerListLegend';
import Print from './core/widgets/Print';

// config portal and auth
esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

// app config and init loading screen
const title = 'Vernonia Wetlands';

const loadingScreen = new LoadingScreen({
  title,
});

const popupText = `<strong>This information is for reference only.</strong>
<br><br>
Official determination of wetlands is under the sole jurisdiction of the Dept. of State Lands and/or by a Dept. of State Lands approved consultant. Visit the <calcite-link href="https://www.oregon.gov/dsl/ww/pages/wetlandconservation.aspx" target="_blank">Dept. of State Lands Wetlands</calcite-link> website for more information.
<br><br>
Development in wetlands in Vernonia is regulated under <calcite-link href="https://www.vernonia-or.gov/municipal-code/title-9/" target="_blank">Title 9 Chapter 6 - Development in Wetlands</calcite-link>.`;

const popupContent = (): HTMLDivElement => {
  const div = document.createElement('div');
  div.innerHTML = popupText;
  return div;
};

new DisclaimerModal({
  title: 'Wetland Map Disclaimer',
  enableDontShow: false,
  text: `Wetland layers herein include Vernonia Local Wetland Inventory, Oregon Dept. of State Lands Wetlands, and U.S. Fish and Wildlife Service National Wetlands Inventory.
  <br><br>
  ${popupText}
  <br><br>
  ${DisclaimerModal.getDefaultDisclaimer()}`,
});

// layers
const taxLots = new FeatureLayer({
  portalItem: {
    id: 'a6063eb199e640e0bbc2d5ceca23de9a',
  },
  opacity: 0.5,
  popupEnabled: false,
  popupTemplate: new TaxLotPopup(),
  renderer: taxLotsImagery,
});

const searchViewModel = new SearchViewModel({
  searchAllEnabled: false,
  includeDefaultSources: false,
  sources: [
    new LayerSearchSource({
      layer: taxLots,
      outFields: ['*'],
      searchFields: ['ADDRESS'],
      suggestionTemplate: '{ADDRESS}',
      placeholder: 'Tax lot by address',
      name: 'Tax lot by address',
      zoomScale: 3000,
      filter: {
        where: 'BNDY_CLIPPED = 0',
      },
    }),
    new LayerSearchSource({
      layer: taxLots,
      outFields: ['*'],
      searchFields: ['OWNER'],
      suggestionTemplate: '{OWNER}',
      placeholder: 'Tax lot by owner',
      name: 'Tax lot by owner',
      zoomScale: 3000,
      filter: {
        where: 'BNDY_CLIPPED = 0',
      },
    }),
    new LayerSearchSource({
      layer: taxLots,
      outFields: ['*'],
      searchFields: ['ACCOUNT_IDS'],
      suggestionTemplate: '{ACCOUNT_IDS}',
      placeholder: 'Tax lot by tax account',
      name: 'Tax lot by tax account',
      zoomScale: 3000,
      filter: {
        where: 'BNDY_CLIPPED = 0',
      },
    }),
    new LayerSearchSource({
      layer: taxLots,
      outFields: ['*'],
      searchFields: ['TAXLOT_ID'],
      suggestionTemplate: '{TAXLOT_ID}',
      placeholder: 'Tax lot by map and lot',
      name: 'Tax lot by map and lot',
      zoomScale: 3000,
      filter: {
        where: 'BNDY_CLIPPED = 0',
      },
    }),
  ],
});

const cityLimits = new FeatureLayer({
  portalItem: {
    id: 'eb0c7507611e44b7923dd1c0167e3b92',
  },
});

const national = new FeatureLayer({
  url: 'https://www.fws.gov/wetlands/arcgis/rest/services/Wetlands/MapServer/0',
  labelsVisible: false,
  title: 'USFW National Wetlands',
  renderer: wetlands.national,
  popupTemplate: new PopupTemplate({
    title: 'USFW National Wetlands',
    content: popupContent,
  }),
});

const state = new FeatureLayer({
  portalItem: {
    id: 'fa8d00ea829c40979b882d2af3b6ae76',
  },
  title: 'DSL Oregon Wetlands',
  renderer: wetlands.state,
  popupTemplate: new PopupTemplate({
    title: 'DSL Oregon Wetlands',
    content: popupContent,
  }),
});

const local = new FeatureLayer({
  portalItem: {
    id: '5452cb87c2934546aa0ac48653231201',
  },
  title: 'Vernonia Local Wetlands',
  renderer: wetlands.local,
  popupTemplate: new PopupTemplate({
    title: 'Vernonia Local Wetlands',
    content: popupContent,
  }),
});

// view
const view = new MapView({
  map: new Map({
    basemap: hybridBasemap('Ao8BC5dsixV4B1uhNaUAK_ejjm6jtZ8G3oXQ5c5Q-WtmpORHOMklBvzqSIEXwdxe'),
    layers: [taxLots, cityLimits, national, state, local],
    // ground: 'world-elevation',
  }),
  zoom: 14,
  center: [-123.18291178267039, 45.8616094153766],
  constraints: {
    rotationEnabled: false,
  },
  popup: {
    dockEnabled: true,
    dockOptions: {
      position: 'bottom-left',
      breakpoint: false,
    },
  },
});

new Viewer({
  view,
  title,
  searchViewModel,
});

view.when(() => {
  view.ui.add(new ViewControl({ view }), 'top-left');

  view.ui.add(
    new UIWidgetSwitcher({
      widgetInfos: [
        {
          widget: new LayerListLegend({
            view,
            addFromWeb: false,
          }),
          text: 'Layers',
          icon: 'layers',
        },
        {
          widget: new Print({
            view,
            printServiceUrl:
              'https://gisportal.vernonia-or.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
          }),
          text: 'Print',
          icon: 'print',
        },
      ],
    }),
    'top-right',
  );

  loadingScreen.end();
});
 */
