import { useEffect, useState } from "react";
import {
  MDBBadge,
  MDBIcon,
  MDBCardTitle,
  MDBModalFooter,
  MDBBtn,
  MDBModalBody,
  MDBModalTitle,
  MDBModalHeader,
  MDBModalContent,
  MDBModalDialog,
  MDBModal,
} from "mdb-react-ui-kit";
import {
  fetchSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
} from "../../services/spaces.api";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";

function Espaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: "",
    location: "",
    montant: "",
    capacity: "",
    availableFrom: "",
    availableTo: "",
    available: false, // booléen initialisé
  });
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const [inputErrors, setInputErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const showToastWithTimeout = ({ type, message }) => {
    setShowToast({ type, visible: true, message });
    setTimeout(() => {
      setShowToast({ type: "", visible: false, message: "" });
    }, 2000);
  };

  useEffect(() => {
    const getSpaces = async () => {
      try {
        const data = await fetchSpaces(token);
        setSpaces(data.spaces || []);
      } catch (err) {
        console.error("Erreur lors du chargement des espaces :", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) getSpaces();
  }, [token, spaces]);

  const handleAddSpace = async () => {
    let errors = {};

    // Validation des champs nécessaires
    ["name", "location", "montant", "capacity"].forEach((field) => {
      if (!newSpace[field]) errors[field] = "Ce champ est requis.";
    });

    // Si disponible est vrai, alors vérifier les champs availableFrom et availableTo
    if (newSpace.available) {
      if (!newSpace.availableFrom || !newSpace.availableTo) {
        errors["availableFrom"] = "Ce champ est requis.";
        errors["availableTo"] = "Ce champ est requis.";
      } else {
        // Comparaison des heures
        const from = newSpace.availableFrom;
        const to = newSpace.availableTo;

        const [fromHour, fromMinute] = from.split(":").map(Number);
        const [toHour, toMinute] = to.split(":").map(Number);

        const fromTotal = fromHour * 60 + fromMinute;
        const toTotal = toHour * 60 + toMinute;

        if (fromTotal >= toTotal) {
          errors["availableFrom"] =
            "L'heure de début doit être inférieure à l'heure de fin.";
          errors["availableTo"] =
            "L'heure de fin doit être supérieure à l'heure de début.";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      showToastWithTimeout({
        type: "error",
        message: "Veuillez corriger les erreurs du formulaire.",
      });
      return;
    }

    setInputErrors({});

    try {
      const res = await createSpace(token, newSpace);

      setSpaces([...spaces, res.newSpace]);
      showToastWithTimeout({
        type: "success",
        message: "Espace ajouté avec succès.",
      });

      setShowAddModal(false);
      setNewSpace({
        name: "",
        location: "",
        montant: "",
        capacity: "",
        availableFrom: "",
        availableTo: "",
        available: false,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      showToastWithTimeout({
        type: "error",
        message: "Erreur lors de l'ajout de l'espace.",
      });
    }
  };
  const handleEdit = (space) => {
    setEditingSpace(space);
    setShowEditModal(true);
  };

  const handleUpdateSpace = async () => {
    try {
      await updateSpace(token, editingSpace.id, editingSpace);
      setSpaces((prevSpaces) =>
        prevSpaces.map((space) =>
          space.id === editingSpace.id ? editingSpace : space
        )
      );
      showToastWithTimeout({ type: "success", message: "Espace mis à jour." });
      setShowEditModal(false);
      // Recharger ou mettre à jour ta liste
    } catch (error) {
      showToastWithTimeout({
        type: "error",
        message: "Échec de la mise à jour.",
      });
    }
  };
  const toggleModal = (space) => {
    setSpaceToDelete(space);
    setShowModal(!showModal);
  };
  const handleDeleteSpace = async (spaceId) => {
    try {
      await deleteSpace(token, spaceId);
      setLoadingDelete(true);
      showToastWithTimeout({
        type: "success",
        message: "Espace supprimé avec succès.",
      });

      setSpaces(spaces);
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'espace:", error);
      showToastWithTimeout({
        type: "error",
        message: "Erreur lors de la suppression de l'espace.",
      });
    } finally {
      setLoadingDelete(false);
    }
  };
  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {showToast.visible && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 9999 }}
        >
          <div
            className={`toast show fade text-white ${
              showToast.type === "success" ? "bg-success" : "bg-danger"
            }`}
            role="alert"
          >
            <div className="toast-header text-white">
              <strong className="me-auto">
                {showToast.type === "success" ? "Succès" : "Erreur"}
              </strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() =>
                  setShowToast({ type: "", visible: false, message: "" })
                }
              ></button>
            </div>
            <div className="toast-body">{showToast.message}</div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <MDBCardTitle className="text-primary mb-4">
          <MDBIcon icon="building" className="me-2" />
          Gestion des espaces
        </MDBCardTitle>
        <MDBBtn
          color="success"
          onClick={() => setShowAddModal(true)}
          style={{ textTransform: "none" }}
        >
          <MDBIcon icon="plus" className="me-2" />
          Ajouter un espace
        </MDBBtn>
      </div>

      <div className="overflow-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Nom</th>
              <th className="px-6 py-3 text-left">Localisation</th>
              <th className="px-6 py-3 text-left">Capacité</th>
              <th className="px-6 py-3 text-left">Montant (€)</th>
              <th className="px-6 py-3 text-left">Disponibilité</th>
              <th className="px-6 py-3 text-left">Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {spaces.length > 0 ? (
              spaces.map((space, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{space.name}</td>
                  <td className="px-6 py-4">{space.location}</td>
                  <td className="px-6 py-4">{space.capacity}</td>
                  <td className="px-6 py-4">{space.montant} €</td>
                  <td className="px-6 py-4">
                    {space.availableFrom && space.availableTo
                      ? `${space.availableFrom} - ${space.availableTo}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {space.available ? (
                      <MDBBadge color="success">Disponible</MDBBadge>
                    ) : (
                      <MDBBadge color="danger">Non disponible</MDBBadge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/admin/espace-details/${space.id}`}>
                        <MDBBtn color="primary" size="sm">
                          <MDBIcon icon="eye" />
                        </MDBBtn>
                      </Link>
                      <MDBBtn
                        color="warning"
                        size="sm"
                        onClick={() => handleEdit(space)}
                      >
                        <MDBIcon icon="pen" />
                      </MDBBtn>
                      <MDBBtn
                        color="danger"
                        size="sm"
                        onClick={() => {
                          setSpaceToDelete(space);
                          toggleModal(space);
                        }}
                      >
                        <MDBIcon icon="trash" />
                      </MDBBtn>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  Aucun espace disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'espace</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {["name", "location", "montant", "capacity"].map((field) => (
            <div key={field} className="mb-3">
              <label>
                {field === "name"
                  ? "Nom de l'espace"
                  : field === "location"
                  ? "Adresse de l'espace"
                  : field === "montant"
                  ? "Prix de l'espace"
                  : "Capacité de l'espace"}
              </label>
              <input
                type="text"
                className="form-control"
                value={editingSpace?.[field] || ""}
                onChange={(e) =>
                  setEditingSpace({ ...editingSpace, [field]: e.target.value })
                }
              />
            </div>
          ))}

          <div className="mb-3">
            <label>Disponibilité</label>
            <select
              className="form-select"
              value={editingSpace?.available ? "true" : "false"}
              onChange={(e) =>
                setEditingSpace({
                  ...editingSpace,
                  available: e.target.value === "true",
                })
              }
            >
              <option value="true">Disponible</option>
              <option value="false">Non disponible</option>
            </select>
          </div>

          {editingSpace?.available && (
            <>
              <div className="mb-3">
                <label>Disponible à partir de</label>
                <input
                  type="time"
                  className="form-control"
                  value={editingSpace?.availableFrom || ""}
                  onChange={(e) =>
                    setEditingSpace({
                      ...editingSpace,
                      availableFrom: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label>Jusqu'à</label>
                <input
                  type="time"
                  className="form-control"
                  value={editingSpace?.availableTo || ""}
                  onChange={(e) =>
                    setEditingSpace({
                      ...editingSpace,
                      availableTo: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <MDBBtn
            color="secondary"
            onClick={() => setShowEditModal(false)}
            style={{ textTransform: "none" }}
          >
            Annuler
          </MDBBtn>
          <MDBBtn
            color="primary"
            onClick={handleUpdateSpace}
            style={{ textTransform: "none" }}
          >
            Sauvegarder
          </MDBBtn>
        </Modal.Footer>
      </Modal>

      {/* Modal Ajout */}
      <MDBModal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Ajouter un espace</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowAddModal(false)}
              />
            </MDBModalHeader>

            <MDBModalBody>
              <form>
                {/* Champs de base avec libellés personnalisés */}
                {[
                  { name: "name", label: "Nom de l'espace" },
                  { name: "location", label: "Adresse de l'espace" },
                  { name: "montant", label: "Prix de l'espace" },
                  { name: "capacity", label: "Capacité de l'espace" },
                ].map(({ name, label }) => (
                  <div className="mb-3" key={name}>
                    <label>{label}</label>
                    <input
                      type="text"
                      className={`form-control ${
                        inputErrors[name] ? "is-invalid" : ""
                      }`}
                      value={newSpace[name]}
                      onChange={(e) =>
                        setNewSpace({ ...newSpace, [name]: e.target.value })
                      }
                    />
                    {inputErrors[name] && (
                      <div className="invalid-feedback">
                        {inputErrors[name]}
                      </div>
                    )}
                  </div>
                ))}

                {/* Select Disponibilité */}
                <div className="mb-3">
                  <label>Disponibilité</label>
                  <select
                    className="form-select"
                    value={newSpace.available ? "true" : "false"}
                    onChange={(e) =>
                      setNewSpace({
                        ...newSpace,
                        available: e.target.value === "true",
                        availableFrom: "",
                        availableTo: "",
                      })
                    }
                  >
                    <option value="true">Disponible</option>
                    <option value="false">Non disponible</option>
                  </select>
                </div>

                {/* Champs heure seulement si disponible */}
                {newSpace.available && (
                  <>
                    <div className="mb-3">
                      <label>Disponible à partir de</label>
                      <input
                        type="time"
                        className={`form-control ${
                          inputErrors.availableFrom ? "is-invalid" : ""
                        }`}
                        value={newSpace.availableFrom}
                        onChange={(e) =>
                          setNewSpace({
                            ...newSpace,
                            availableFrom: e.target.value,
                          })
                        }
                      />
                      {inputErrors.availableFrom && (
                        <div className="invalid-feedback">
                          {inputErrors.availableFrom}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label>Jusqu'à</label>
                      <input
                        type="time"
                        className={`form-control ${
                          inputErrors.availableTo ? "is-invalid" : ""
                        }`}
                        value={newSpace.availableTo}
                        onChange={(e) =>
                          setNewSpace({
                            ...newSpace,
                            availableTo: e.target.value,
                          })
                        }
                      />
                      {inputErrors.availableTo && (
                        <div className="invalid-feedback">
                          {inputErrors.availableTo}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </form>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                onClick={() => setShowAddModal(false)}
                style={{ textTransform: "none" }}
              >
                Annuler
              </MDBBtn>
              <MDBBtn
                color="success"
                onClick={handleAddSpace}
                style={{ textTransform: "none" }}
              >
                Ajouter
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      {/* Modal de suppression */}
      <MDBModal open={showModal} onClose={setShowModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Confirmer la suppression</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              Êtes-vous sûr de vouloir supprimer l'espace ? Cette action est
              irréversible.
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={() => handleDeleteSpace(spaceToDelete.id)}
                disabled={loadingDelete}
              >
                {loadingDelete ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
}

export default Espaces;
