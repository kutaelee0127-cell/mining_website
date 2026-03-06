import { RevisionService } from "../revision/RevisionService";

export interface HomePageData {
  heroTitle: string;
  heroSubtitle: string;
  ctaHref: string;
}

export interface AboutPageData {
  designerTitle: string;
  instagramUrl: string;
  naverMapUrl: string;
}

export interface BookingPageData {
  bookingUrl: string;
  hintKey: string;
}

const initialHome: HomePageData = {
  heroTitle: "msg.welcome",
  heroSubtitle: "app.brandName",
  ctaHref: "/booking",
};

const initialAbout: AboutPageData = {
  designerTitle: "about.designer.title",
  instagramUrl: "https://instagram.com",
  naverMapUrl: "https://map.naver.com",
};

const initialBooking: BookingPageData = {
  bookingUrl: "https://smartstore.naver.com",
  hintKey: "msg.bookingHint",
};

export class PageService {
  private home = initialHome;
  private about = initialAbout;
  private booking = initialBooking;

  constructor(private readonly revisions: RevisionService) {}

  getHome(): HomePageData {
    return this.home;
  }

  updateHome(input: Partial<Pick<HomePageData, "heroTitle" | "heroSubtitle">>): HomePageData {
    const summary: string[] = [];

    if (typeof input.heroTitle === "string" && input.heroTitle !== this.home.heroTitle) {
      this.home = { ...this.home, heroTitle: input.heroTitle };
      summary.push("hero_title");
    }

    if (typeof input.heroSubtitle === "string" && input.heroSubtitle !== this.home.heroSubtitle) {
      this.home = { ...this.home, heroSubtitle: input.heroSubtitle };
      summary.push("hero_subtitle");
    }

    if (summary.length > 0) {
      this.revisions.append(summary);
    }

    return this.home;
  }

  getAbout(): AboutPageData {
    return this.about;
  }

  updateAbout(input: Partial<Pick<AboutPageData, "designerTitle" | "instagramUrl" | "naverMapUrl">>): AboutPageData {
    const summary: string[] = [];

    if (typeof input.designerTitle === "string" && input.designerTitle !== this.about.designerTitle) {
      this.about = { ...this.about, designerTitle: input.designerTitle };
      summary.push("about_designer_title");
    }

    if (typeof input.instagramUrl === "string" && input.instagramUrl !== this.about.instagramUrl) {
      this.about = { ...this.about, instagramUrl: input.instagramUrl };
      summary.push("about_instagram_url");
    }

    if (typeof input.naverMapUrl === "string" && input.naverMapUrl !== this.about.naverMapUrl) {
      this.about = { ...this.about, naverMapUrl: input.naverMapUrl };
      summary.push("about_naver_map_url");
    }

    if (summary.length > 0) {
      this.revisions.append(summary);
    }

    return this.about;
  }

  getBooking(): BookingPageData {
    return this.booking;
  }

  updateBooking(input: Partial<Pick<BookingPageData, "bookingUrl" | "hintKey">>): BookingPageData {
    const summary: string[] = [];

    if (typeof input.bookingUrl === "string" && input.bookingUrl !== this.booking.bookingUrl) {
      this.booking = { ...this.booking, bookingUrl: input.bookingUrl };
      summary.push("booking_url");
    }

    if (typeof input.hintKey === "string" && input.hintKey !== this.booking.hintKey) {
      this.booking = { ...this.booking, hintKey: input.hintKey };
      summary.push("booking_hint");
    }

    if (summary.length > 0) {
      this.revisions.append(summary);
    }

    return this.booking;
  }
}
