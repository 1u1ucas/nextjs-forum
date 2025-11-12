import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface ResetPasswordProps {
    name?: string | null;
    resetUrl: string;
}

export default function ResetPassword({ name, resetUrl }: ResetPasswordProps) {
    return (
        <Html>
            <Head />
            <Preview>Réinitialisez votre mot de passe Forum.</Preview>
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Section>
                        <Heading style={styles.heading}>Réinitialisation du mot de passe</Heading>
                        <Text style={styles.paragraph}>
                            Bonjour {name ? `${name}` : "!"}
                        </Text>
                        <Text style={styles.paragraph}>
                            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le
                            bouton ci-dessous pour en définir un nouveau.
                        </Text>
                        <Section style={styles.buttonContainer}>
                            <Button href={resetUrl} style={styles.button}>
                                Réinitialiser mon mot de passe
                            </Button>
                        </Section>
                        <Text style={styles.paragraph}>
                            Ce lien expirera dans une heure. Si vous n&apos;êtes pas à l&apos;origine de cette
                            demande, vous pouvez ignorer cet email.
                        </Text>
                        <Hr style={styles.hr} />
                        <Text style={styles.footer}>
                            Forum · Merci de faire partie de la communauté.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const styles = {
    body: {
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#f7fafc",
        padding: "32px 0",
    },
    container: {
        maxWidth: "520px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "32px",
        border: "1px solid #e2e8f0",
    },
    heading: {
        color: "#111827",
        fontSize: "24px",
        fontWeight: 700,
        marginBottom: "16px",
    },
    paragraph: {
        color: "#4a5568",
        fontSize: "15px",
        lineHeight: "24px",
        margin: "12px 0",
    },
    buttonContainer: {
        textAlign: "center" as const,
        margin: "24px 0",
    },
    button: {
        backgroundColor: "#f97316",
        borderRadius: "8px",
        color: "#ffffff",
        fontWeight: 600,
        padding: "12px 24px",
        textDecoration: "none",
        display: "inline-block",
    },
    hr: {
        borderColor: "#e2e8f0",
        margin: "24px 0",
    },
    footer: {
        color: "#94a3b8",
        fontSize: "12px",
    },
};


