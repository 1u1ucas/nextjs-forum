import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
      { error: "Une réservation payée ne peut pas être annulée" },
      { status: 400 }
    );
  }

  const updatedReservation = await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
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
