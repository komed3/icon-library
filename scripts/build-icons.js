#!/usr/bin/env node

/**
 * Icon Pack Builder Script
 * Scans the icons/ directory structure and generates JSON index file
 * for the SVG icon download website
 */

import {} from 'node:fs';
import {} from 'node:path';

const ICONS_DIR = '../icons';
const OUTPUT_FILE = '../icons-data.json';
