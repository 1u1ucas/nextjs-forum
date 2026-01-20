import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation non trouvée" },
      { status: 404 }
    );
  }

  if (reservation.userId !== session.user.id) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  if (reservation.status === "PAID") {
    return NextResponse.json(
      { error: "Cette réservation est déjà payée" },
      { status: 400 }
    );
  }

  if (reservation.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Impossible de payer une réservation annulée" },
      { status: 400 }
    );
  }

  // Simulate payment processing delay
  await sleep(1000);

  console.log(`Paiement fictif effectué pour réservation ${id}`);

  const updatedReservation = await prisma.reservation.update({
    where: { id },
    data: { status: "PAID" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json(updatedReservation);
}
