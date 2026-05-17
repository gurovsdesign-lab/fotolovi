"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Camera, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventGallery } from "./EventGallery";
import { ParticipantsSpotlightSection } from "./ParticipantsSpotlightSection";
import type { Photo } from "@/types/photo";
import type {
  LiveScreenStateWithParticipant,
  SpotlightParticipantWithPhotos,
} from "@/types/spotlight";

type TabId = "photos" | "participants";

export function EventExperienceTabs({
  photos,
  eventId,
  eventTitle,
  participants,
  liveState,
}: {
  photos: Photo[];
  eventId: string;
  eventTitle: string;
  participants: SpotlightParticipantWithPhotos[];
  liveState: LiveScreenStateWithParticipant;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("photos");

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">
        <TabButton
          id="photos"
          activeTab={activeTab}
          onSelect={setActiveTab}
          icon={<Camera className="size-4" />}
        >
          Фото
        </TabButton>
        <TabButton
          id="participants"
          activeTab={activeTab}
          onSelect={setActiveTab}
          icon={<Sparkles className="size-4" />}
        >
          Участники
        </TabButton>
      </div>

      {activeTab === "photos" ? (
        <EventGallery photos={photos} eventId={eventId} eventTitle={eventTitle} />
      ) : (
        <ParticipantsSpotlightSection
          eventId={eventId}
          participants={participants}
          liveState={liveState}
        />
      )}
    </section>
  );
}

function TabButton({
  id,
  activeTab,
  onSelect,
  icon,
  children,
}: {
  id: TabId;
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition",
        isActive ? "bg-ink text-white shadow-soft" : "text-muted hover:bg-ivory hover:text-ink",
      )}
      onClick={() => onSelect(id)}
      aria-pressed={isActive}
    >
      {icon}
      {children}
    </button>
  );
}
