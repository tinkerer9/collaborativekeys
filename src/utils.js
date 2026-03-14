/*!
 *  CollaboKeys: a collaborative keyboard game
 *  Copyright (C) 2026  @tinkerer9 and @LethalShadowFlame
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

//This script handles Game utilities.

module.exports = {
    sendError(content) { // send error stuff
        return `<li class="bad">${content}</li>`
    },
    
    inBold(content) { // wrap in bold
        return `<b>${content}</b>`
    },
    
    sendBoldError(content) { // simple pipeline/bundle
        return `<li class="bad"><b>${content}</b></li>`; //Can't use sendError(inBold(content)) because functions aren't in scope
    },
    
    sendInfo(content) {
        return `<li>${content}</li>`
    },

    sendSucess(content) {
        return `<li class="good">${content}</li>`
    }
}

