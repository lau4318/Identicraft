#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { resolveUUID, getSkinURL, renderAvatar, renderCube, renderBody, renderBust, getSkin } from '../lib/minecraft.js';

const program = new Command();

program
  .name('identicraft')
  .description('CLI tool for rendering Minecraft avatars')
  .version('1.0.0')
  .argument('<renderType>', 'Type of render: avatar, cube, body, bust, or skin')
  .argument('<username>', 'Minecraft username or UUID')
  .option('-o, --output <file>', 'Output file path', 'output.png')
  .option('-s, --size <size>', 'Size in pixels (8-512)', '512')
  .action(async (renderType, username, options) => {
    try {
      const validTypes = ['avatar', 'cube', 'body', 'bust', 'skin'];
      
      if (!validTypes.includes(renderType.toLowerCase())) {
        console.error(`❌ Error: Invalid render type "${renderType}"`);
        console.error(`   Valid types: ${validTypes.join(', ')}`);
        process.exit(1);
      }

      const size = parseInt(options.size);
      if (isNaN(size) || size < 8 || size > 512) {
        console.error('❌ Error: Size must be between 8 and 512');
        process.exit(1);
      }

      console.log(`🔍 Resolving UUID for "${username}"...`);
      const uuid = await resolveUUID(username);
      console.log(`✅ UUID: ${uuid}`);

      console.log(`🎨 Fetching skin...`);
      const skinURL = await getSkinURL(uuid);
      
      if (!skinURL) {
        console.error('❌ Error: Skin not found');
        process.exit(1);
      }

      console.log(`🖼️  Rendering ${renderType}...`);
      let imageBuffer;

      switch (renderType.toLowerCase()) {
        case 'avatar':
          imageBuffer = await renderAvatar(skinURL, size);
          break;
        case 'cube':
          imageBuffer = await renderCube(skinURL, size);
          break;
        case 'body':
          imageBuffer = await renderBody(skinURL, size);
          break;
        case 'bust':
          imageBuffer = await renderBust(skinURL, size);
          break;
        case 'skin':
          imageBuffer = await getSkin(skinURL);
          break;
      }

      writeFileSync(options.output, imageBuffer);
      console.log(`✨ Saved to: ${options.output}`);
      console.log(`📏 Size: ${renderType === 'skin' ? '64x64' : `${size}px`}`);

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();