import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';

// $ is not jQuery. It's coming from bling.js
autocomplete( $('#address'), $('#lat'), $('#lng') );

typeAhead( $('.search') );