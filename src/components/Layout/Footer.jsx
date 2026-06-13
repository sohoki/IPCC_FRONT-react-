import React from 'react'
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
            <Container as="footer" className="py-4 mt-auto">
                <h6 className="text-center mb-2">
                    IPCC
                </h6>
                <p className="text-center text-muted">
                    IPCC 공공기관 관리.
                </p>
            </Container>
            )
}
export default Footer
