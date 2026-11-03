import { build } from 'vite';
import { writeFile } from 'node:fs/promises';

await build({ base: './', build: { outDir: 'dist-wallpaper' } });

const properties = {
  accent: { order: 1, text: 'Opal accent', type: 'color', value: '0.753 0.890 0.796' },
  minimal: { order: 2, text: 'Minimal mode (clock and search only)', type: 'bool', value: false },
  reducemotion: { order: 3, text: 'Reduce motion and pause video', type: 'bool', value: false },
  backgroundfile: {
    order: 4,
    text: 'Background image',
    type: 'file',
    fileType: 'image',
    value: '',
  },
  backgroundvideo: {
    order: 5,
    text: 'Background video (WebM)',
    type: 'file',
    fileType: 'video',
    value: '',
  },
};
const labels = {
  clock: 'Clock',
  search: 'Search',
  tasks: 'Tasks',
  links: 'Quick links',
  focus: 'Focus timer',
  reminders: 'Reminders',
  system: 'Local system monitor',
};
Object.entries(labels).forEach(([id, label], index) => {
  properties[`show${id}`] = {
    order: 10 + index,
    text: `Show ${label.toLowerCase()}`,
    type: 'bool',
    value: id !== 'system',
  };
});
await writeFile(
  'dist-wallpaper/project.json',
  JSON.stringify(
    {
      title: 'Ryo — Your own little universe',
      type: 'web',
      file: 'index.html',
      description: 'A lightweight, local-first celestial startpage.',
      general: { properties },
    },
    null,
    2,
  ),
);
await writeFile(
  'dist-wallpaper/README.txt',
  'Import index.html from this folder using Create Wallpaper in Wallpaper Engine.\nKeep all assets beside it. This folder is self-contained; do not import the source repository.\nChoose backgrounds and widgets in Wallpaper Engine settings or Ryo Customize.\nWebM is the supported video format inside Wallpaper Engine; MP4 works in the regular browser build.\n',
);
console.log('Wallpaper Engine project ready in dist-wallpaper/');
