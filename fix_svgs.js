const fs = require('fs');

const legacyPath = '/home/ilmar/citizenos/citizenos-fe/src/app/core/components/home/home.component.html';
const newPath = '/home/ilmar/citizenos/citizenos-fe-next/src/app/features/home/home.component.html';

const legacyContent = fs.readFileSync(legacyPath, 'utf8');
const newContent = fs.readFileSync(newPath, 'utf8');

// Extract first SVG: between <svg width="346"... and its closing </svg>
const svg1Start = legacyContent.indexOf('<svg width="346" height="360" viewBox="0 0 346 360"');
const svg1End = legacyContent.indexOf('</svg>', svg1Start) + 6;
const svg1 = legacyContent.substring(svg1Start, svg1End);

// Extract second SVG: between <svg width="134"... and its closing </svg>
const svg2Start = legacyContent.indexOf('<svg width="134" height="120" viewBox="0 0 134 120"');
const svg2End = legacyContent.indexOf('</svg>', svg2Start) + 6;
const svg2 = legacyContent.substring(svg2Start, svg2End);

// Replace in new file
const newSvg1Start = newContent.indexOf('<svg width="346" height="360" viewBox="0 0 346 360"');
const newSvg1End = newContent.indexOf('</svg>', newSvg1Start) + 6;
let updatedContent = newContent.substring(0, newSvg1Start) + svg1 + newContent.substring(newSvg1End);

const newSvg2Start = updatedContent.indexOf('<svg width="134" height="120" viewBox="0 0 134 120"');
const newSvg2End = updatedContent.indexOf('</svg>', newSvg2Start) + 6;
updatedContent = updatedContent.substring(0, newSvg2Start) + svg2 + updatedContent.substring(newSvg2End);

fs.writeFileSync(newPath, updatedContent, 'utf8');
console.log('SVGs restored successfully.');
