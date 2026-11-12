import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadSans} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

// Caption = elegant serif (italic for keywords). UI/titles = Inter. Prompts/code = JetBrains Mono.
export const serif = loadSerif('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
loadSerif('italic', {weights: ['400'], subsets: ['latin']});
export const sans = loadSans('normal', {weights: ['500', '600', '800'], subsets: ['latin']}).fontFamily;
export const mono = loadMono('normal', {weights: ['400', '600'], subsets: ['latin']}).fontFamily;
