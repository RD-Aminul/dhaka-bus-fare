import { getStopEnglishName } from '../src/data/englishNames.js';
import { searchRouteAndFare, stopMatches } from '../src/utils/fareEngine.js';

console.log('--- English Names check ---');
const testStops = ['মিরপুর-১০', 'ফার্মগেট', 'শাহবাগ', 'সদরঘাট', 'কালশী', 'উত্তরা', 'মতিঝিল', 'যাত্রাবাড়ী', 'মহাখালী'];
testStops.forEach(s => {
  console.log(s, '->', getStopEnglishName(s));
});

console.log('\n--- stopMatches check ---');
console.log('stopMatches("মিরপুর-১০", "mirpur"):', stopMatches('মিরপুর-১০', 'mirpur'));
console.log('stopMatches("মিরপুর-১০", "Mirpur 10"):', stopMatches('মিরপুর-১০', 'Mirpur 10'));
console.log('stopMatches("ফার্মগেট", "farmgate"):', stopMatches('ফার্মগেট', 'farmgate'));
console.log('stopMatches("শাহবাগ", "shahbag"):', stopMatches('শাহবাগ', 'shahbag'));
console.log('stopMatches("সদরঘাট", "sadarghat"):', stopMatches('সদরঘাট', 'sadarghat'));

console.log('\n--- searchRouteAndFare with English inputs ---');
console.log('From Farmgate to Shahbag:');
const resEn = searchRouteAndFare('Farmgate', 'Shahbag');
console.log('resEn directRoute:', resEn.directRoute ? resEn.directRoute.id : 'null', 'fare:', resEn.fare);

console.log('From Mirpur 10 to Motijheel:');
const res2 = searchRouteAndFare('Mirpur 10', 'Motijheel');
console.log('res2 directRoute:', res2.directRoute ? res2.directRoute.id : 'null', 'fare:', res2.fare);
