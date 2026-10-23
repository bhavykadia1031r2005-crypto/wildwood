"use client";

import { amenityLabels, priceBounds, stayAreas, stayTypeSingular, type Stay } from "@/data/accommodations";
import { areas, categoryMeta, type PointOfInterest } from "@/data/attractions";
import type { SignatureEvent } from "@/data/events";
import type { ExploreCategory } from "@/data/moreToExplore";
import type { SiteContent } from "@/lib/cms/content";
import { plainText } from "@/lib/cms/render";
import { saveContent, useContent } from "@/lib/cms/store";
import { Badge } from "../../ui";
import { ContentFrame } from "../ContentFrame";
import { CopyForm } from "../CopyForm";
import type { FieldDef, Option } from "../fields";
import { ListEditor } from "../ListEditor";

const ACCENT_HINT = "Wrap words in *asterisks* to show them in the yellow script style.";
const options = (record: Record<string, string>): Option[] => Object.entries(record).map(([id, label]) => ({ id, label }));

/* ---------- Hero & events ---------- */

const heroFields: FieldDef<SiteContent["hero"]>[] = [
  { key: "line1", label: "Headline, line 1", type: "text", accent: true, required: true, maxLength: 28, wide: true },
  { key: "line2", label: "Headline, line 2", type: "text", accent: true, maxLength: 28, wide: true, hint: ACCENT_HINT },
  { key: "intro", label: "Intro sentence", type: "textarea", rows: 2, maxLength: 140 },
  { key: "primaryLabel", label: "Main button text", type: "text", maxLength: 28, hint: "Leave empty to hide the button." },
  { key: "primaryHref", label: "Main button link", type: "link", required: true },
  { key: "secondaryLabel", label: "Second button text", type: "text", maxLength: 28, hint: "Leave empty to hide the button." },
  { key: "secondaryHref", label: "Second button link", type: "link", required: true },
  { key: "showCalendar", label: "Show the events calendar", type: "toggle", description: "The flip calendar in the bottom-right corner of the hero." },
];

const eventFields: FieldDef<SignatureEvent>[] = [
  { key: "title", label: "Event name", type: "text", required: true, maxLength: 60, wide: true },
  { key: "location", label: "Location", type: "text", required: true, maxLength: 40 },
  { key: "season", label: "When (in words)", type: "text", required: true, maxLength: 24, hint: "e.g. Early summer" },
  { key: "tab", label: "Month tab", type: "text", required: true, maxLength: 10, hint: "Label in the month strip, e.g. Jun" },
  { key: "month", label: "Big date", type: "text", required: true, maxLength: 7, hint: "Large text on the page, e.g. Jun or Jul–Aug" },
  { key: "band", label: "Season band", type: "select", options: ["Spring", "Summer", "Fall", "Winter", "Year-round"].map((s) => ({ id: s, label: s })) },
  { key: "text", label: "Description", type: "textarea", required: true, maxLength: 150, hint: "Shown as two short lines on the calendar." },
];

export function HeroPage() {
  const events = useContent("events");
  return (
    <ContentFrame href="/admin/content/hero">
      <CopyForm contentKey="hero" title="Hero copy" description="Text and buttons over the background video." fields={heroFields} />
      <ListEditor<SignatureEvent>
        title="Events calendar"
        description="Pages of the flip calendar, in order. Dates vary yearly, so describe them by month or season."
        itemName="event"
        items={events}
        onSave={(next) => saveContent("events", next)}
        fields={eventFields}
        max={12}
        create={() => ({ id: "", title: "", month: "", tab: "", band: "Summer", season: "", location: "", text: "", imageId: "wildwoods-sign-night" })}
        row={{ title: (e) => e.title, subtitle: (e) => `${e.tab} · ${e.location}` }}
        footnote="With no events left, the calendar is hidden from the hero."
      />
    </ContentFrame>
  );
}

/* ---------- Trip planner ---------- */

export function TripPlannerPage() {
  return (
    <ContentFrame href="/admin/content/trip-planner">
      <CopyForm
        contentKey="itinerary"
        title="Section copy"
        description="The trip-planner questions and itinerary results stay as they are."
        fields={[
          { key: "title", label: "Heading", type: "text", accent: true, required: true, maxLength: 60, hint: ACCENT_HINT },
          { key: "intro", label: "Intro paragraph", type: "textarea", maxLength: 200 },
          { key: "buttonLabel", label: "Button text", type: "text", required: true, maxLength: 28 },
          { key: "note", label: "Small print under the button", type: "text", maxLength: 60 },
        ]}
      />
    </ContentFrame>
  );
}

/* ---------- Map & places ---------- */

const areaOptions: Option[] = [...areas.map((a) => ({ id: a.id, label: a.name })), { id: "nearby", label: "Nearby (off the island)" }];
const DEFAULT_CENTER = areas.find((a) => a.id === "wildwood")!.center;

const placeFields: FieldDef<PointOfInterest>[] = [
  { key: "name", label: "Place name", type: "text", required: true, maxLength: 70, wide: true },
  { key: "category", label: "Category", type: "select", options: Object.entries(categoryMeta).map(([id, m]) => ({ id, label: m.label })) },
  { key: "area", label: "Area", type: "select", options: areaOptions },
  { key: "blurb", label: "Description", type: "textarea", required: true, maxLength: 260 },
  { key: "imageId", label: "Photo", type: "image" },
  { key: "lat", label: "Latitude", type: "number", min: 38.85, max: 39.12, step: 0.00001 },
  {
    key: "lng",
    label: "Longitude",
    type: "number",
    min: -75,
    max: -74.65,
    step: 0.00001,
    hint: "Copy coordinates from OpenStreetMap or Google Maps.",
  },
];

/** Where a place sits on the illustrated 2D map: middle of its area, ocean side for beaches. */
function sketchFor(p: PointOfInterest): [number, number] {
  if (p.area === "nearby") return [0.95, 0.4];
  const area = areas.find((a) => a.id === p.area)!;
  const t = (area.span[0] + area.span[1]) / 2;
  if (p.area === "west-wildwood") return [t, -0.85];
  return [t, p.category === "beaches" || p.category === "boardwalk" ? 0.6 : 0.1];
}

export function MapPage() {
  const places = useContent("places");
  return (
    <ContentFrame href="/admin/content/map">
      <CopyForm
        contentKey="explore"
        title="Section copy"
        fields={[
          { key: "title", label: "Heading", type: "text", accent: true, required: true, maxLength: 60, hint: ACCENT_HINT },
          { key: "intro", label: "Intro paragraph", type: "textarea", maxLength: 200 },
        ]}
      />
      <ListEditor<PointOfInterest>
        title="Places on the map"
        description="Pins on the interactive map and markers on the illustrated 2D guide."
        itemName="place"
        items={places}
        onSave={(next) => saveContent("places", next)}
        fields={placeFields}
        searchable
        max={60}
        dialogSize="lg"
        create={() => ({
          id: "",
          name: "",
          category: "family",
          area: "wildwood",
          lat: DEFAULT_CENTER[0],
          lng: DEFAULT_CENTER[1],
          blurb: "",
          imageId: undefined,
          sketch: [0.42, 0.1],
        })}
        prepare={(p, prev) => {
          let next = p;
          // A new place left at the default coordinates moves to the centre of the area picked.
          if (!prev && p.area !== "nearby" && p.lat === DEFAULT_CENTER[0] && p.lng === DEFAULT_CENTER[1]) {
            const center = areas.find((a) => a.id === p.area)!.center;
            next = { ...next, lat: center[0], lng: center[1] };
          }
          if (!prev || prev.area !== p.area) next = { ...next, sketch: sketchFor(next) };
          return next;
        }}
        row={{
          title: (p) => p.name,
          subtitle: (p) => `${categoryMeta[p.category].label} · ${areaOptions.find((a) => a.id === p.area)?.label}`,
          image: (p) => p.imageId,
        }}
        footnote="Map positions are approximate. New places are placed in the middle of their area on the 2D guide."
      />
    </ContentFrame>
  );
}

/* ---------- Things to do ---------- */

const categoryFields: FieldDef<ExploreCategory>[] = [
  { key: "label", label: "Title", type: "text", required: true, maxLength: 28 },
  { key: "href", label: "Link", type: "link", required: true, hint: "A category page on wildwoodsnj.com, or a section here like /#stays." },
  { key: "description", label: "Description", type: "textarea", required: true, maxLength: 180 },
  { key: "image", label: "Image", type: "image", required: true, altKey: "alt" },
  { key: "alt", label: "Image description (alt text)", type: "text", required: true, maxLength: 160, wide: true, hint: "Describe the photo for people using screen readers." },
];

export function ThingsToDoPage() {
  const categories = useContent("categories");
  return (
    <ContentFrame href="/admin/content/things-to-do">
      <CopyForm
        contentKey="thingsToDo"
        title="Section copy"
        fields={[
          { key: "title", label: "Heading", type: "text", accent: true, required: true, maxLength: 60, hint: ACCENT_HINT },
          { key: "intro", label: "Intro paragraph", type: "textarea", maxLength: 200 },
        ]}
      />
      <ListEditor<ExploreCategory>
        title="Category cards"
        description="Shown five to a row on desktop, in this order."
        itemName="card"
        items={categories}
        onSave={(next) => saveContent("categories", next)}
        fields={categoryFields}
        max={15}
        create={() => ({ id: "", label: "", description: "", href: "https://wildwoodsnj.com/", image: "", alt: "" })}
        row={{ title: (c) => c.label, subtitle: (c) => c.description, image: (c) => c.image }}
      />
    </ContentFrame>
  );
}

/* ---------- Places to stay ---------- */

const stayFields: FieldDef<Stay>[] = [
  { key: "name", label: "Name", type: "text", required: true, maxLength: 60, wide: true },
  { key: "type", label: "Type", type: "select", options: options(stayTypeSingular) },
  { key: "area", label: "Area", type: "select", options: options(stayAreas) },
  {
    key: "priceFrom",
    label: "Sample price per night",
    type: "number",
    min: priceBounds.min,
    max: priceBounds.max,
    prefix: "$",
    hint: `$${priceBounds.min}–$${priceBounds.max}, the range of the price filter.`,
  },
  { key: "rating", label: "Sample rating (out of 5)", type: "number", min: 1, max: 5, step: 0.1 },
  { key: "maxGuests", label: "Sleeps up to", type: "number", min: 1, max: 16 },
  { key: "amenities", label: "Amenities", type: "checkboxes", options: options(amenityLabels) },
  { key: "imageId", label: "Photo", type: "image", required: true },
  { key: "description", label: "Description", type: "textarea", required: true, maxLength: 220 },
];

export function StaysPage() {
  const stays = useContent("stays");
  return (
    <ContentFrame href="/admin/content/stays">
      <CopyForm
        contentKey="staysCopy"
        title="Section copy"
        fields={[
          { key: "title", label: "Heading", type: "text", accent: true, required: true, maxLength: 60, hint: ACCENT_HINT },
          { key: "intro", label: "Intro paragraph", type: "textarea", maxLength: 200 },
          {
            key: "notice",
            label: "Sample-data notice",
            type: "textarea",
            rows: 2,
            maxLength: 160,
            hint: "Keep this while the listings are samples, so visitors know they aren't real bookings.",
          },
        ]}
      />
      <ListEditor<Stay>
        title="Listings"
        description="List order is the “Recommended” sort on the homepage."
        itemName="stay"
        items={stays}
        onSave={(next) => saveContent("stays", next)}
        fields={stayFields}
        searchable
        max={40}
        dialogSize="lg"
        create={() => ({
          id: "",
          name: "",
          type: "hotel",
          area: "wildwood",
          priceFrom: 180,
          rating: 4.5,
          maxGuests: 4,
          amenities: [],
          imageId: "",
          description: "",
          rank: stays.length + 1,
        })}
        row={{
          title: (s) => s.name,
          subtitle: (s) => `${stayTypeSingular[s.type]} · ${stayAreas[s.area]} · from $${s.priceFrom}`,
          image: (s) => s.imageId,
          badge: () => <Badge tone="sun">Sample</Badge>,
        }}
      />
    </ContentFrame>
  );
}

/* ---------- Closing banner ---------- */

export function BannerPage() {
  return (
    <ContentFrame href="/admin/content/banner">
      <CopyForm
        contentKey="cta"
        title="Banner copy"
        fields={[
          { key: "title", label: "Heading", type: "text", accent: true, required: true, maxLength: 60, wide: true, hint: ACCENT_HINT },
          { key: "text", label: "Supporting line", type: "textarea", rows: 2, maxLength: 160 },
          { key: "primaryLabel", label: "Main button text", type: "text", maxLength: 28, hint: "Leave empty to hide the button." },
          { key: "primaryHref", label: "Main button link", type: "link", required: true },
          { key: "secondaryLabel", label: "Second button text", type: "text", maxLength: 28, hint: "Leave empty to hide the button." },
          { key: "secondaryHref", label: "Second button link", type: "link", required: true },
        ]}
      />
    </ContentFrame>
  );
}

/* ---------- Navigation & footer ---------- */

type FooterColumn = SiteContent["footer"]["columns"][number];
type NavLink = SiteContent["navigation"]["links"][number];

export function NavigationPage() {
  const navigation = useContent("navigation");
  const footer = useContent("footer");
  return (
    <ContentFrame href="/admin/content/navigation">
      <ListEditor<NavLink>
        title="Menu links"
        description="Links in the floating nav and the mobile menu. Links to hidden homepage sections are left out automatically."
        itemName="link"
        items={navigation.links}
        onSave={(links) => saveContent("navigation", { ...navigation, links })}
        fields={[
          { key: "label", label: "Label", type: "text", required: true, maxLength: 22 },
          { key: "href", label: "Link", type: "link", required: true, hint: "e.g. /#stays, /events or https://…" },
        ]}
        max={7}
        create={() => ({ id: "", label: "", href: "/#" })}
        row={{ title: (l) => l.label, subtitle: (l) => l.href }}
      />
      <CopyForm
        contentKey="navigation"
        title="Menu buttons"
        description="The yellow and outlined buttons on the right of the nav."
        fields={[
          { key: "primaryLabel", label: "Main button text", type: "text", required: true, maxLength: 22 },
          { key: "primaryHref", label: "Main button link", type: "link", required: true },
          { key: "secondaryLabel", label: "Second button text", type: "text", required: true, maxLength: 22 },
          { key: "secondaryHref", label: "Second button link", type: "link", required: true },
        ]}
      />
      <CopyForm
        contentKey="footer"
        title="Footer text"
        fields={[
          { key: "blurb", label: "About text under the logo", type: "textarea", maxLength: 220 },
          { key: "newsletterTitle", label: "Newsletter heading", type: "text", required: true, maxLength: 60, wide: true },
        ]}
      />
      <ListEditor<FooterColumn>
        title="Footer link columns"
        itemName="column"
        items={footer.columns}
        onSave={(columns) => saveContent("footer", { ...footer, columns })}
        fields={[
          { key: "title", label: "Column heading", type: "text", required: true, maxLength: 24, wide: true },
          { key: "links", label: "Links", type: "links", required: true, max: 8 },
        ]}
        max={4}
        dialogSize="lg"
        create={() => ({ id: "", title: "", links: [{ id: "link", label: "", href: "/#" }] })}
        row={{ title: (c) => c.title, subtitle: (c) => c.links.map((l) => plainText(l.label)).join(" · ") }}
      />
    </ContentFrame>
  );
}
