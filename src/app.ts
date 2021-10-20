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

new DisclaimerModal({
  title: 'Wetland Map Disclaimer',
  enableDontShow: false,
  text: `Wetland layers herein include Vernonia Local Wetland Inventory, Oregon Dept. of State Lands Wetlands, and U.S. Fish and Wildlife Service National Wetlands Inventory.<br><br><strong>This information is for reference only.</strong> Official determination of wetlands is under the sole jurisdiction of the Dept. of State Lands and/or by a Dept. of State Lands approved consultant. Visit the <calcite-link href="https://www.oregon.gov/dsl/ww/pages/wetlandconservation.aspx" target="_blank">Dept. of State Lands Wetlands</calcite-link> website, or contact City Hall for more information.<br><br>${DisclaimerModal.getDefaultDisclaimer()}`,
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

const popupText = `<strong>This information is for reference only.</strong> Official determination of wetlands is under the sole jurisdiction of the Dept. of State Lands and/or by a Dept. of State Lands approved consultant. Visit the <calcite-link href="https://www.oregon.gov/dsl/ww/pages/wetlandconservation.aspx" target="_blank">Dept. of State Lands Wetlands</calcite-link> website, or contact City Hall for more information.`;

const national = new FeatureLayer({
  url: 'https://www.fws.gov/wetlands/arcgis/rest/services/Wetlands/MapServer/0',
  labelsVisible: false,
  title: 'USFW National Wetlands',
  renderer: wetlands.national,
  popupTemplate: new PopupTemplate({
    title: 'USFW National Wetlands',
    content: () => {
      const div = document.createElement('div');
      div.innerHTML = popupText;
      return div;
    },
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
    content: () => {
      const div = document.createElement('div');
      div.innerHTML = popupText;
      return div;
    },
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
    content: () => {
      const div = document.createElement('div');
      div.innerHTML = popupText;
      return div;
    },
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
