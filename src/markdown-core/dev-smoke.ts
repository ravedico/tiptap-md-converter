import { mdToTiptap, tiptapToMd } from './index';

async function demo() {
  const md = `# Hello

This is **bold** and a list:
- a
- b
`;

  const doc = await mdToTiptap(md);
  console.log('TT doc:', doc);

  const back = await tiptapToMd(doc);
  console.log('MD back:\n', back);
}

demo();