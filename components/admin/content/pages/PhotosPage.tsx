"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { resolveImage } from "@/lib/cms/render";
import { saveContent, useContent } from "@/lib/cms/store";
import { Badge, Button, Card, CardHeader, EmptyState } from "../../ui";
import { ContentFrame } from "../ContentFrame";
import { CopyForm } from "../CopyForm";
import { Dialog } from "../Dialog";
import { IconButton } from "../fields";
import { ImagePicker, Thumb } from "../ImagePicker";
import { useToast } from "../Toaster";

const MAX_PHOTOS = 16;

export function PhotosPage() {
  return (
    <ContentFrame href="/admin/content/photos">
      <PhotoStripCard />
      <CopyForm
        contentKey="pocketGuide"
        title="QR pocket-guide card"
        description="The QR code itself always points to the visitor guide page."
        fields={[
          { key: "eyebrow", label: "Small label", type: "text", required: true, maxLength: 36 },
          { key: "title", label: "Heading", type: "text", accent: true, required: true, maxLength: 60, wide: true, hint: "Wrap words in *asterisks* to show them in the yellow script style." },
          { key: "text", label: "Description", type: "textarea", maxLength: 220 },
        ]}
      />
    </ContentFrame>
  );
}

function PhotoStripCard() {
  const guide = useContent("pocketGuide");
  const { photos } = guide;
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const room = MAX_PHOTOS - photos.length;

  const save = (next: string[], message?: string) => {
    const previous = photos;
    const result = saveContent("pocketGuide", { ...guide, photos: next });
    if (!result.ok) {
      toast({ message: result.error, tone: "error" });
      return false;
    }
    if (message) toast({ message, action: { label: "Undo", run: () => saveContent("pocketGuide", { ...guide, photos: previous }) } });
    return true;
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...photos];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    save(next);
  };

  return (
    <Card>
      <CardHeader
        title={
          <>
            Photo strip <Badge>{photos.length}</Badge>
          </>
        }
        description="Glides sideways as visitors scroll, just above the QR card. Remove the last photo to hide the strip."
        action={
          <Button
            variant="primary"
            disabled={room <= 0}
            onClick={() => {
              setPicked([]);
              setAdding(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" /> Add photos
          </Button>
        }
      />
      {photos.length === 0 ? (
        <EmptyState title="No photos in the strip" description="The strip is hidden on the homepage until you add a photo." />
      ) : (
        <ol className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((ref, i) => {
            const alt = resolveImage(ref)?.alt || `Photo ${i + 1}`;
            return (
              <li key={`${i}-${ref.slice(0, 64)}`} className="group overflow-hidden rounded-xl border border-gray-200 bg-white">
                <Thumb refValue={ref} alt={alt} className="aspect-[4/3] w-full rounded-none" />
                <div className="flex items-center gap-1 px-1.5 py-1">
                  <span className="w-6 text-center text-[0.72rem] tabular-nums text-gray-400">{i + 1}</span>
                  <IconButton label={`Move photo ${i + 1} left`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowLeft className="size-3.5" />
                  </IconButton>
                  <IconButton label={`Move photo ${i + 1} right`} disabled={i === photos.length - 1} onClick={() => move(i, 1)}>
                    <ArrowRight className="size-3.5" />
                  </IconButton>
                  <span className="ml-auto">
                    <IconButton label={`Remove photo ${i + 1}`} danger onClick={() => save(photos.filter((_, j) => j !== i), "Photo removed from the strip.")}>
                      <X className="size-4" />
                    </IconButton>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        size="lg"
        title="Add photos to the strip"
        description={`Pick up to ${room} more. They're added to the end of the strip.`}
        footer={
          <>
            <Button onClick={() => setAdding(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={picked.length === 0}
              onClick={() => {
                if (save([...photos, ...picked], `${picked.length} photo${picked.length > 1 ? "s" : ""} added.`)) setAdding(false);
              }}
            >
              Add {picked.length || ""} photo{picked.length === 1 ? "" : "s"}
            </Button>
          </>
        }
      >
        <ImagePicker
          multiple
          selected={picked}
          onPick={(ref) => {
            // Uploads are added straight to the selection; library photos toggle.
            setPicked((p) => (p.includes(ref) ? p.filter((x) => x !== ref) : p.length < room ? [...p, ref] : p));
          }}
        />
      </Dialog>
    </Card>
  );
}
