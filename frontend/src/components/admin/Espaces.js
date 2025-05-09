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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import Papa from "papaparse";
import { useTranslation } from "react-i18next";

function Espaces() {
  const { t } = useTranslation();

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const showToastWithTimeout = ({ type, message }) => {
    setShowToast({ type, visible: true, message });
    setTimeout(() => {
      setShowToast({ type: "", visible: false, message: "" });
    }, 2000);
  };
  const handleExportCSV = () => {
    const csvData = (spaces || []).map((space, index) => ({
      "#": index + 1,
      Nom: space.name,
      Localisation: space.location,
      Capacité: space.capacity,
      Montant: `${space.montant} €`,
      Disponibilité: space.available
        ? `${space.availableFrom} - ${space.availableTo}`
        : t("no_dispo"),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "espaces.csv";
    link.click();

    setShowToast({
      type: "success",
      visible: true,
      message: t("csv_exported"),
    });

    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(t("space_details"), 14, 16);

    const rows = (spaces || []).map((space, index) => [
      index + 1,
      space.name,
      space.location,
      space.capacity,
      `${space.montant} €`,
      space.available
        ? `${space.availableFrom} - ${space.availableTo}`
        : t("no_dispo"),
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          t("name_space"),
          t("location"),
          t("capacity"),
          t("amount"),
          t("disponi"),
        ],
      ],
      body: rows,
      startY: 20,
    });

    doc.save("espaces.pdf");

    setShowToast({
      type: "success",
      visible: true,
      message: t("pdf_exported"),
    });

    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };
  const filteredSpaces = spaces.filter((space) => {
    // Filtrer par recherche (nom ou localisation)
    const searchMatch =
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrer par statut
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "available" && space.available) ||
      (statusFilter === "unavailable" && !space.available);

    return searchMatch && statusMatch;
  });

  useEffect(() => {
    const getSpaces = async () => {
      try {
        const data = await fetchSpaces(token);
        setSpaces(data.spaces || []);
      } catch (err) {
        console.error(t("error_space_data"), err);
      } finally {
        setLoading(false);
      }
    };

    if (token) getSpaces();
  }, [token, spaces,t]);

  const handleAddSpace = async () => {
    let errors = {};

    // Validation des champs nécessaires
    ["name", "location", "montant", "capacity"].forEach((field) => {
      if (!newSpace[field]) errors[field] = t("champ_req");
    });

    // Si disponible est vrai, alors vérifier les champs availableFrom et availableTo
    if (newSpace.available) {
      if (!newSpace.availableFrom || !newSpace.availableTo) {
        errors["availableFrom"] = t("champ_req");
        errors["availableTo"] = t("champ_req");
      } else {
        // Comparaison des heures
        const from = newSpace.availableFrom;
        const to = newSpace.availableTo;

        const [fromHour, fromMinute] = from.split(":").map(Number);
        const [toHour, toMinute] = to.split(":").map(Number);

        const fromTotal = fromHour * 60 + fromMinute;
        const toTotal = toHour * 60 + toMinute;

        if (fromTotal >= toTotal) {
          errors["availableFrom"] = t("error_inf");
          errors["availableTo"] = t("error_sup");
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      showToastWithTimeout({
        type: "error",
        message: t("correct"),
      });
      return;
    }

    setInputErrors({});

    try {
      const res = await createSpace(token, newSpace);

      setSpaces([...spaces, res.newSpace]);
      showToastWithTimeout({
        type: "success",
        message: t("success_add_space"),
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
      console.error(t("error_add_space"), error);
      showToastWithTimeout({
        type: "error",
        message: t("error_add_space"),
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
      showToastWithTimeout({
        type: "success",
        message: t("success_update_space"),
      });
      setShowEditModal(false);
      // Recharger ou mettre à jour ta liste
    } catch (error) {
      showToastWithTimeout({
        type: "error",
        message: t("error_update_space"),
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
        message: t("success_delete_space"),
      });

      setSpaces(spaces);
      setShowModal(false);
    } catch (error) {
      console.error(t("error_delete_space"), error);
      showToastWithTimeout({
        type: "error",
        message: t("error_delete_space"),
      });
    } finally {
      setLoadingDelete(false);
    }
  };
  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">{t("loading")}</div>
    );
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
          {t("gest_space")}
        </MDBCardTitle>
        <MDBBtn
          color="success"
          onClick={() => setShowAddModal(true)}
          style={{ textTransform: "none" }}
        >
          <MDBIcon icon="plus" className="me-2" />
          {t("add_space")}
        </MDBBtn>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          className="form-control"
          placeholder={t("search_field")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">{t("all")}</option>
          <option value="available">{t("dispo")}</option>
          <option value="unavailable">{t("no_dispo")}</option>
        </select>{" "}
        <MDBBtn color="success" onClick={handleExportCSV}>
          <MDBIcon icon="file-csv" className="me-2" />
          {t("export_csv")}
        </MDBBtn>
        <MDBBtn color="danger" onClick={handleExportPDF}>
          <MDBIcon icon="file-pdf" className="me-2" />
          {t("export_pdf")}
        </MDBBtn>
      </div>

      <div className="overflow-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">{t("name_space")}</th>
              <th className="px-6 py-3 text-left">{t("location")}</th>
              <th className="px-6 py-3 text-left">{t("capacity")}</th>
              <th className="px-6 py-3 text-left">{t("amount")} (€)</th>
              <th className="px-6 py-3 text-left">{t("disponi")} </th>
              <th className="px-6 py-3 text-left">{t("status")} </th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpaces.length > 0 ? (
              filteredSpaces.map((space, index) => (
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
                      <MDBBadge color="success">{t("dispo")}</MDBBadge>
                    ) : (
                      <MDBBadge color="danger">{t("no_dispo")}</MDBBadge>
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
                  {t("no_space")}
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
          <Modal.Title>{t("update_space")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {["name", "location", "montant", "capacity"].map((field) => (
            <div key={field} className="mb-3">
              <label>
                {field === "name"
                  ? t("name_space")
                  : field === "location"
                  ? t("location")
                  : field === "montant"
                  ? t("price")
                  : t("capacity")}
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
            <label>{t("disponi")}</label>
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
              <option value="true">{t("dispo")}</option>
              <option value="false">{t("no_dispo")}</option>
            </select>
          </div>

          {editingSpace?.available && (
            <>
              <div className="mb-3">
                <label>{t("dispo_from")}</label>
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
                <label>{t("dispo_to")}</label>
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
            {t("cancel")}
          </MDBBtn>
          <MDBBtn
            color="primary"
            onClick={handleUpdateSpace}
            style={{ textTransform: "none" }}
          >
            {t("save")}
          </MDBBtn>
        </Modal.Footer>
      </Modal>

      {/* Modal Ajout */}
      <MDBModal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t("add_space")}</MDBModalTitle>
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
                  { name: "name", label: t("name_space") },
                  { name: "location", label: t("location") },
                  { name: "montant", label: t("price") },
                  { name: "capacity", label: t("capacity") },
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
                  <label>{t("disponi")}</label>
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
                    <option value="true">{t("dispo")}</option>
                    <option value="false">{t("no_dispo")}</option>
                  </select>
                </div>

                {/* Champs heure seulement si disponible */}
                {newSpace.available && (
                  <>
                    <div className="mb-3">
                      <label>{t("dispo_from")}</label>
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
                      <label>{t("dispo_to")}</label>
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
                {t("cancel")}
              </MDBBtn>
              <MDBBtn
                color="success"
                onClick={handleAddSpace}
                style={{ textTransform: "none" }}
              >
                {t("add_space")}
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
              <MDBModalTitle>{t("confirm_delete")}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>{t("confirm_delete_space")}</MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowModal(false)}>
                {t("cancel")}
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
                    {t("deleting")}
                  </>
                ) : (
                  t("delete")
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
