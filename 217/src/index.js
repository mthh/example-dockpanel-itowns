import '../style/index.css';
import { CommandRegistry } from '@lumino/commands';
import { Message } from '@lumino/messaging';
import {
  BoxPanel, CommandPalette, ContextMenu, DockPanel, Menu, MenuBar, Widget
} from '@lumino/widgets';
import * as itowns from 'itowns';

const commands = new CommandRegistry();

function createMenu() {
  let sub1 = new Menu({ commands });
  sub1.title.label = 'More...';
  sub1.title.mnemonic = 0;
  sub1.addItem({ command: 'example:one' });
  sub1.addItem({ command: 'example:two' });
  sub1.addItem({ command: 'example:three' });
  sub1.addItem({ command: 'example:four' });

  let sub2 = new Menu({ commands });
  sub2.title.label = 'More...';
  sub2.title.mnemonic = 0;
  sub2.addItem({ command: 'example:one' });
  sub2.addItem({ command: 'example:two' });
  sub2.addItem({ command: 'example:three' });
  sub2.addItem({ command: 'example:four' });
  sub2.addItem({ type: 'submenu', submenu: sub1 });

  let root = new Menu({ commands });
  root.addItem({ command: 'example:copy' });
  root.addItem({ command: 'example:cut' });
  root.addItem({ command: 'example:paste' });
  root.addItem({ type: 'separator' });
  root.addItem({ command: 'example:new-tab' });
  root.addItem({ command: 'example:close-tab' });
  root.addItem({ command: 'example:save-on-exit' });
  root.addItem({ type: 'separator' });
  root.addItem({ command: 'example:open-task-manager' });
  root.addItem({ type: 'separator' });
  root.addItem({ type: 'submenu', submenu: sub2 });
  root.addItem({ type: 'separator' });
  root.addItem({ command: 'example:close' });

  return root;
}


class ContentWidget extends Widget {
  static createNode() {
    let node = document.createElement('div');
    let content = document.createElement('div');
    let input = document.createElement('input');
    input.placeholder = 'Placeholder...';
    content.appendChild(input);
    node.appendChild(content);
    return node;
  }

  constructor(name) {
    super({ node: ContentWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('content');
    this.addClass(name.toLowerCase());
    this.title.label = name;
    this.title.closable = true;
    this.title.caption = `Long description for: ${name}`;
  }

  get inputNode() {
    return this.node.getElementsByTagName('input')[0];
  }

  onActivateRequest(msg) {
    if (this.isAttached) {
      this.inputNode.focus();
    }
  }
}

class ItownsWidget extends Widget {
  static createNode() {
    let node = document.createElement('div');
    let content = document.createElement('div');
    content.id = 'viewerDiv';
    node.appendChild(content);
    return node;
  }

  constructor(name, title) {
    super({ node: ItownsWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('content-itowns');
    this.addClass(name.toLowerCase());
    this.title.label = title;
    this.title.closable = true;
    this.title.caption = `Long description for: ${name}`;
  }

  onAfterAttach(msg) {
    const placement = {
        coord: new itowns.Coordinates('EPSG:4326', 4.22, 44.844),
        range: 6000,
        tilt: 17,
    }
    const viewerDiv = document.getElementById('viewerDiv');
    this.view = new itowns.GlobeView(viewerDiv, placement);

    this.view.addLayer(new itowns.ColorLayer('ORTHO', {
      source: new itowns.WMTSSource({
        protocol: 'wmts',
        url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
        name: 'ORTHOIMAGERY.ORTHOPHOTOS',
        tileMatrixSet: 'PM',
        format: 'image/jpeg',
        projection: 'EPSG:3857',
        zoom: { min: 0, max: 17 },
      }),
    }));

    this.view.addLayer(new itowns.ElevationLayer('MNT_WORLD', {
      source: new itowns.WMTSSource({
        protocol: 'wmts',
        url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
        name: 'ELEVATION.ELEVATIONGRIDCOVERAGE',
        tileMatrixSet: 'WGS84G',
        format: 'image/x-bil;bits=32',
        projection: 'EPSG:4326',
        zoom: { min: 0, max: 11 },
      }),
    }));

    this.view.addLayer(new itowns.ElevationLayer('MNT_HIGHRES', {
      source: new itowns.WMTSSource({
        protocol: 'wmts',
        url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
        name: 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
        tileMatrixSet: 'WGS84G',
        format: 'image/x-bil;bits=32',
        projection: 'EPSG:4326',
        zoom: { min: 11, max: 14 },
      }),
    }));
  }

  get viewerDiv() {
    return this.node.getElementById('viewerDiv');
  }

  onActivateRequest(msg) {
    if (this.isAttached) {
      this.viewerDiv.focus();
    }
  }
  onResize(msg) {
    if (this.isVisible && this.view) {
      this.view.mainLoop.gfxEngine.renderer.clear(true, true, false);
      this.view.mainLoop.gfxEngine.width = msg.width;
      this.view.mainLoop.gfxEngine.height = msg.height;
      this.view.mainLoop.gfxEngine.fullSizeRenderTarget.setSize(msg.width, msg.height);
      this.view.mainLoop.gfxEngine.renderer.setSize(msg.width, msg.height);
      this.view.mainLoop.gfxEngine.renderView(this.view);
      this.view.camera.resize(msg.width, msg.height);
      this.view.notifyChange(this.view.camera.camera3D);
      console.log('Resized itwons view');
    }
  }
}


function main() {

  commands.addCommand('example:cut', {
    label: 'Cut',
    mnemonic: 1,
    iconClass: 'fa fa-cut',
    execute: () => {
      console.log('Cut');
    }
  });

  commands.addCommand('example:copy', {
    label: 'Copy File',
    mnemonic: 0,
    iconClass: 'fa fa-copy',
    execute: () => {
      console.log('Copy');
    }
  });

  commands.addCommand('example:paste', {
    label: 'Paste',
    mnemonic: 0,
    iconClass: 'fa fa-paste',
    execute: () => {
      console.log('Paste');
    }
  });

  commands.addCommand('example:new-tab', {
    label: 'New Tab',
    mnemonic: 0,
    caption: 'Open a new tab',
    execute: () => {
      console.log('New Tab');
    }
  });

  commands.addCommand('example:close-tab', {
    label: 'Close Tab',
    mnemonic: 2,
    caption: 'Close the current tab',
    execute: () => {
      console.log('Close Tab');
    }
  });

  commands.addCommand('example:save-on-exit', {
    label: 'Save on Exit',
    mnemonic: 0,
    caption: 'Toggle the save on exit flag',
    execute: () => {
      console.log('Save on Exit');
    }
  });

  commands.addCommand('example:open-task-manager', {
    label: 'Task Manager',
    mnemonic: 5,
    isEnabled: () => false,
    execute: () => { }
  });

  commands.addCommand('example:close', {
    label: 'Close',
    mnemonic: 0,
    iconClass: 'fa fa-close',
    execute: () => {
      console.log('Close');
    }
  });

  commands.addKeyBinding({
    keys: ['Accel X'],
    selector: 'body',
    command: 'example:cut'
  });

  commands.addKeyBinding({
    keys: ['Accel C'],
    selector: 'body',
    command: 'example:copy'
  });

  commands.addKeyBinding({
    keys: ['Accel V'],
    selector: 'body',
    command: 'example:paste'
  });

  commands.addKeyBinding({
    keys: ['Accel J', 'Accel J'],
    selector: 'body',
    command: 'example:new-tab'
  });

  commands.addKeyBinding({
    keys: ['Accel M'],
    selector: 'body',
    command: 'example:open-task-manager'
  });

  let menu1 = createMenu();
  menu1.title.label = 'File';
  menu1.title.mnemonic = 0;

  let menu2 = createMenu();
  menu2.title.label = 'Edit';
  menu2.title.mnemonic = 0;

  let menu3 = createMenu();
  menu3.title.label = 'View';
  menu3.title.mnemonic = 0;

  let bar = new MenuBar();
  bar.addMenu(menu1);
  bar.addMenu(menu2);
  bar.addMenu(menu3);
  bar.id = 'menuBar';

  let palette = new CommandPalette({ commands });
  palette.addItem({ command: 'example:cut', category: 'Edit' });
  palette.addItem({ command: 'example:copy', category: 'Edit' });
  palette.addItem({ command: 'example:paste', category: 'Edit' });
  palette.addItem({ command: 'example:new-tab', category: 'File' });
  palette.addItem({ command: 'example:close-tab', category: 'File' });
  palette.addItem({ command: 'example:save-on-exit', category: 'File' });
  palette.addItem({ command: 'example:open-task-manager', category: 'File' });
  palette.addItem({ command: 'example:close', category: 'File' });
  palette.id = 'palette';

  let contextMenu = new ContextMenu({ commands });

  document.addEventListener('contextmenu', (event) => {
    if (contextMenu.open(event)) {
      event.preventDefault();
    }
  });

  contextMenu.addItem({ command: 'example:cut', selector: '.content' });
  contextMenu.addItem({ command: 'example:copy', selector: '.content' });
  contextMenu.addItem({ command: 'example:paste', selector: '.content' });

  contextMenu.addItem({ command: 'example:save-on-exit', selector: '.lm-CommandPalette-input' });
  contextMenu.addItem({ command: 'example:open-task-manager', selector: '.lm-CommandPalette-input' });
  contextMenu.addItem({ type: 'separator', selector: '.lm-CommandPalette-input' });

  document.addEventListener('keydown', (event) => {
    commands.processKeydownEvent(event);
  });

  let r1 = new ItownsWidget('Red', 'Itowns 2.17.0');
  let b1 = new ContentWidget('Blue');
  let g1 = new ContentWidget('Green');
  let y1 = new ContentWidget('Yellow');
  let r2 = new ContentWidget('Red');
  let b2 = new ContentWidget('Blue');

  let dock = new DockPanel();
  dock.addWidget(r1);
  dock.addWidget(b1, { mode: 'split-right', ref: r1 });
  dock.addWidget(y1, { mode: 'split-bottom', ref: b1 });
  dock.addWidget(g1, { mode: 'split-left', ref: y1 });
  dock.addWidget(r2, { ref: b1 });
  dock.addWidget(b2, { mode: 'split-right', ref: y1 });
  dock.id = 'dock';

  let savedLayouts = [];

  commands.addCommand('save-dock-layout', {
    label: 'Save Layout',
    caption: 'Save the current dock layout',
    execute: () => {
      savedLayouts.push(dock.saveLayout());
      palette.addItem({
        command: 'restore-dock-layout',
        category: 'Dock Layout',
        args: { index: savedLayouts.length - 1 }
      });
    }
  });

  commands.addCommand('restore-dock-layout', {
    label: args => {
      return `Restore Layout ${args.index}`;
    },
    execute: args => {
      dock.restoreLayout(savedLayouts[args.index]);
    }
  });

  palette.addItem({
    command: 'save-dock-layout',
    category: 'Dock Layout',
    rank: 0
  });

  BoxPanel.setStretch(dock, 1);

  let main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';
  main.addWidget(palette);
  main.addWidget(dock);

  window.onresize = () => { main.update(); };

  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);
}


window.onload = main;
