export const DIALOG_POINTERS = "DEF_DIAL.DAT";
export const TOWN_DEFINITIONS = "DEF_TOWN.DAT";

export class ZoneLabel {
    public readonly zoneLabel: string;

    private constructor(zoneLabel: string) {
        this.zoneLabel = zoneLabel;
    }

    static fromZoneNumber(zoneNumber: number) {
        return new ZoneLabel(`Z${zoneNumber.toString().padStart(2, '0')}`);
    }

    static fromZoneLabel(zoneLabel: string) {
        return new ZoneLabel(zoneLabel);
    }

    getHorizon() {
        return `${this.zoneLabel}H.SCX`;
    }

    getTerrain() {
        return `${this.zoneLabel}L.SCX`;
    }

    getSpriteSlot(i: number) {
        return `${this.zoneLabel}SLOT${i.toString().padStart(1, '0')}.BMX`;
    }

    getPalette() {
        return `${this.zoneLabel}.PAL`;
    }

    getTile(x: number, y: number) {
        return `T${this.zoneLabel.substring(1, 2)}${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
    }

    getTileWorld(x: number, y: number) {
        return `${this.getTile(x, y)}.WLD`;
    }

    getTileData(x: number, y: number) {
        return `${this.getTile(x, y)}.DAT`;
    }

    getTable() {
        return `${this.zoneLabel}.TBL`;
    }

    // TODO: I think zoneLabel is already 3 characters long
    // so this function is probably not needed and can be removed.
    getZone() {
        return this.zoneLabel.substring(0, 3);
    }

    getZoneNumber() {
        return parseInt(this.zoneLabel.substring(1, 3));
    }

    getZoneReference() {
        return `${this.zoneLabel}REF.DAT`;
    }

    getZoneDefault() {
        return `${this.zoneLabel}DEF.DAT`;
    }

    getZoneMap() {
        return `${this.zoneLabel}MAP.DAT`;
    }

    getZoneDat() {
        return `${this.zoneLabel}.DAT`;
    }
}
