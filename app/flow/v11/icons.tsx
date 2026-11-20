"use client";
// Filled, coloured icons (Phosphor "fill" and "duotone"), and app-style icon tiles.
import {
  ArrowCounterClockwiseIcon, ArrowLeftIcon, ArrowRightIcon, ArrowsLeftRightIcon, ArrowUpRightIcon, BellIcon, BookOpenTextIcon, BriefcaseIcon, CalendarCheckIcon, CalendarDotsIcon,
  CalendarPlusIcon, CaretDownIcon, CaretRightIcon, ChatsCircleIcon, CheckCircleIcon, CheckIcon, ClockIcon, CopyIcon, DeviceMobileIcon, EnvelopeSimpleIcon,
  FileTextIcon, GlobeHemisphereWestIcon, GraduationCapIcon, HouseIcon, InfoIcon, LinkSimpleIcon, ListChecksIcon, LockSimpleIcon, MagicWandIcon,
  NotePencilIcon, PauseIcon, PencilSimpleIcon, PlayIcon, PlusIcon, SignOutIcon, SparkleIcon, TrashIcon, UserCircleIcon, UserSwitchIcon, UsersThreeIcon,
  VideoCameraIcon, WarningCircleIcon, XIcon, type Icon,
} from "@phosphor-icons/react";

const map: Record<string, Icon> = {
  home: HouseIcon, tasks: ListChecksIcon, courses: BookOpenTextIcon, jobs: BriefcaseIcon, cv: FileTextIcon, abroad: GlobeHemisphereWestIcon, profile: UserCircleIcon,
  sessions: ChatsCircleIcon, calendar: CalendarDotsIcon, booked: CalendarCheckIcon, book: CalendarPlusIcon, bell: BellIcon, clock: ClockIcon, video: VideoCameraIcon,
  mail: EnvelopeSimpleIcon, phone: DeviceMobileIcon, link: LinkSimpleIcon, copy: CopyIcon, arrow: ArrowRightIcon, open: ArrowUpRightIcon, back: ArrowLeftIcon, down: CaretDownIcon,
  right: CaretRightIcon, check: CheckIcon, done: CheckCircleIcon, x: XIcon, lock: LockSimpleIcon, plus: PlusIcon, trash: TrashIcon, spark: SparkleIcon,
  play: PlayIcon, pause: PauseIcon, replay: ArrowCounterClockwiseIcon, info: InfoIcon, note: NotePencilIcon, edit: PencilSimpleIcon, wand: MagicWandIcon,
  switch: UserSwitchIcon, swap: ArrowsLeftRightIcon, people: UsersThreeIcon, grad: GraduationCapIcon, warn: WarningCircleIcon, out: SignOutIcon,
};
export type Weight = "fill" | "duotone" | "bold" | "regular";
export function Ico({ n, s = 20, w = "fill", c }: { n: string; s?: number; w?: Weight; c?: string }) {
  const C = map[n] ?? InfoIcon;
  return <C size={s} weight={w} color={c ?? "currentColor"} aria-hidden="true" />;
}

// An app-style icon: a coloured rounded tile with a white filled glyph.
export type Tone = "pink" | "purple" | "blue" | "green" | "orange" | "teal" | "slate" | "amber";
export const toneOf: Record<string, Tone> = { home: "purple", sessions: "pink", tasks: "blue", courses: "orange", jobs: "teal", cv: "purple", abroad: "green", profile: "slate" };
export function AppIcon({ n, tone, s = 36 }: { n: string; tone?: Tone; s?: number }) {
  return <span className={"ai ai-" + (tone ?? toneOf[n] ?? "purple")} style={{ width: s, height: s, borderRadius: s * 0.3 }} aria-hidden="true"><Ico n={n} s={Math.round(s * 0.56)} w="fill" /></span>;
}
