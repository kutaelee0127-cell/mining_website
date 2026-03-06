import { useEffect, useState } from "react";
import { addReview, listReviews, removeReview, type ReviewItemDto } from "../../api/reviews";
import { ReviewEditorDrawer } from "../../components/ReviewEditorDrawer";

export interface ReviewsPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function ReviewsPage({ t, isAdmin }: ReviewsPageProps) {
  const [items, setItems] = useState<ReviewItemDto[]>([]);

  const reload = async () => {
    setItems(await listReviews());
  };

  useEffect(() => {
    void reload();
  }, []);

  if (items.length === 0) {
    return <p>{t("msg.reviewsEmpty")}</p>;
  }

  return (
    <main>
      <h1>{t("nav.reviews")}</h1>
      {items.map((item) => (
        <article key={item.id}>
          <p aria-label={t("field.rating")}>{item.rating}</p>
          <p>{item.text}</p>
          <p>{item.author}</p>
          <p>{item.source}</p>
        </article>
      ))}
      {isAdmin ? (
        <>
          <ReviewEditorDrawer
            t={t}
            onAdd={async (input) => {
              await addReview(input);
              await reload();
            }}
          />
          <button type="button" onClick={async () => {
            if (items[0]) {
              await removeReview(items[0].id);
              await reload();
            }
          }}>{t("action.delete")}</button>
        </>
      ) : null}
    </main>
  );
}
