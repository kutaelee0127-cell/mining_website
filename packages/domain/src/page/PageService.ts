import { RevisionService } from "../revision/RevisionService";

export interface HomePageData {
  heroTitle: string;
  heroSubtitle: string;
  ctaHref: string;
}

const initialHome: HomePageData = {
  heroTitle: "msg.welcome",
  heroSubtitle: "app.brandName",
  ctaHref: "/booking",
};

export class PageService {
  private home = initialHome;

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
}
