import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';

// $ is not jQuery. It's coming from bling.js
autocomplete( $('#address'), $('#lat'), $('#lng') );