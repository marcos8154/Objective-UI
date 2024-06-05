import { UIPage } from "./UIPage";
import { Widget } from "./Widget";

/**
 * A class that generates a simplified, 
 * standard Exception view at the point on 
 * the page where an error occurred
 */
export class DefaultExceptionPage
{
    constructor(error: Error)
    {
        if ((error instanceof Error) == false) return;
        console.error(error);
        if (UIPage.DISABLE_EXCEPTION_PAGE)
            return;

        var errorsStr = `${error.stack}`.split('\n');
        var title = `${error}`;
        var paneId = Widget.generateUUID();
        var rawHtml = `<div id="exceptionPane_${paneId}">`;
        rawHtml += `<img style="padding-left:30px; padding-top: 80px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAHYAAAB2AH6XKZyAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABFZJREFUeJztm0GLFEcUx/+vpzurQhaVCKJB/QSehJwjgrCzB4egm4PsIcJOEslNkNw8GQQ9Rp0h5GhcJQ4kuKeQfAEvCehRHNwNaxDUJbqZme56Ocz2Tk93VXXPdndZ7PaD3enueq/q/V6/elU9vQtUUkkllVSyc4VUDVfX/FlitFjgEBgIf1hEjll2zGM6Sj0xfh08/FDZAZvnK4KpefUT92ERAXBUDZbCA4zDDvPtIuC1AbAUPmz/uPQAWAy/2WYkAFbCmwrAdocH9DXAWng2OgVshDc2BWyFNxEAq+HfzxSwB95YDbAW3uwU2L7wQOoUsBTezBSwF95IDbAa3kwGyJ20At5kALYzPLCVnaAN8CYywGb4IpMg+xSwCd5EBuwEeCDLFLAR3lQGbHd4AHCVLebg/2OgVRN8p+d7j6+fprfFIupFGQBD8MsUiPp3p6b+Kh4tm6gzwMCdF8yz194jPJBlGYwcFznnGWhdO/nBnyUwTSTaDCiz4NUE34kO9+1v/iwLbjE23khhpJsshKxpi10XtAKm5vXP5O8S1ctgifBgwHO8J2PjlQE//HUYpH6XOPHTYBHwzMCVT+nf2HDFw4fXwMp3iRM9DRYFP3IsNp4KJOx4S/B6yfw0GPpQCLzKuYiuAH4PhHuMAvcohFhKh+elAP4RDoJjzPhD2q9Esu0DDMMzACHcL27UqQsAC4/4zL5Vf5GZG3J46rx54c21mzQAgEu/rF+AX3uaBg9kqQFlwGuCEAK6YqTVPkGDVwfdOQZ15PDuJjwAuMFGa4ZpoA+ADi4HvNSvWGoz9W8tPGIvbG6foMGbv905cDQISfiFFns+nO/z14Ay4SXOjac2A6CZvav9zjdLPBXqtJs0eNZzzxJwlwU9kMFPH/AXIWgm2fmEATD+PB+FH93h+q7A/2mhNcqE++coeL3qza/9434uhWduZIUHit4HQK6vrNyJMVliw429h5KZUAQ8UOQ+AHL9fPAbp4Lquwf9n6NBCCUPPFDUPkChr4SXOZdiI4TT6z2HiJu92gcB5p60r/A0dw2In+eEV/qjsGFBD+JzPpT75yjoBt55AHfHxolyaCTfPgDYGrwiA+Q21JEVvHhhXHvpzUNQZ6zL3DUAhuAht9EtddMfJQtjl92zoGEmZIEHtroPAPLBy7yL2RDzQ/1SR/Wp9eQSufbSm2fmzH9HPPk+AMgPr7o7ERsfwVfpSx03pvf7i9EgtJs0gCMuSvuVyGT7AMAIfFxFu9RRMgjSfhWS+qVoKfCaIIQ2DtwfL99bv+DXQOT0b2q3t8SND/f3O5fvrX/t10AIaj+ANONERP+dYEnwUr+iNkOFU4Fb6xKAxOof62BYUqjuU60LAWSFB7LUgNC5IuFVNZAlbSnn0mqf1kdEdDVgJTQuA/7Kr7xnbDxBKyXCP5doAtD+xwg1wVgu5c4z8I4Hx8cdpSZAyykgo9PM8LTMcL6UaFdSSSWVVLLj5X+IDiuFkg1oQQAAAABJRU5ErkJggg==" />`;
        rawHtml += `<h4 style="padding-left:30px"> ${title} </h4>`;
        rawHtml += `<p style="padding-left:30px; font-size: 20px">`;
        for (var i = 0; i < errorsStr.length; i++)
        {
            var erro = errorsStr[i];
            var msg = erro.trim();

            if (msg.indexOf('at') == 0)
            {
                var codePath = msg.substring(3, msg.indexOf('('));
                codePath = codePath.trim();
                msg = msg.replace(codePath,
                    `<span class="badge badge-secondary"> ${codePath} </span>`);
            }

            rawHtml += `${msg} <br/>`;
        }

        rawHtml += `</p>
            <button type="button" onclick="document.getElementById('exceptionPane_${paneId}').remove()" style="margin-left:30px; margin-bottom: 30px" class="btn btn-warning"> Hide </button>
        </div>
        `;

        var c = new DOMParser().parseFromString(rawHtml, 'text/html').body;
        document.body.prepend(c);
    }
}